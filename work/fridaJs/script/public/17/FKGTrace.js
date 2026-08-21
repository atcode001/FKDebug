/**
 * FKGTrace — 封装 libFKGTrace.so 原生库调用
 * 
 * 结构对齐 StalkerTraceRangeC (16版)：
 *   构造函数初始化 → start() → Interceptor.attach → onEnter: load+init+run → onLeave: unrun
 * 
 * 用法（参考 gumtrace_test.js）:
 *   var fkg = new FKGTrace(
 *       targetSo,                         // libname
 *       exportOffset,                     // traceOffset
 *       { libs: [targetSo], track: true },// traceRang
 *       addrMappingArray,                 // addrMappings
 *       0,                                // traceMode (0=Stand)
 *       function(args) { return true; },  // beginEvent
 *       function(ret) {},                 // endEvnet
 *       null                              // logCallback (null=文件模式)
 *   );
 *
 *   // 手动停止
 *   fkg.stop();
 */

/**
 * @param {string} libname         - 目标 SO 名称
 * @param {NativePointer|number} traceOffset - 目标函数偏移（相对 libname 基址）
 * @param {object} traceRang       - 跟踪范围 { libs: [...], track: true }
 * @param {Array} addrMappings     - 地址映射 [{address, name, moduleName, onEnter?, onLeave?}]
 * @param {number} traceMode       - 跟踪模式 0=Stand, 1=DEBUG, 2=Stable
 * @param {function} beginEvent    - (args) => boolean，返回 true 开始跟踪
 * @param {function} endEvnet      - (ret) => void，跟踪结束回调
 * @param {function|null} logCallback - 日志回调 NativeCallback，null 走文件
 */
function FKGTrace(libname, traceOffset, traceRang, addrMappings, traceMode, beginEvent, endEvnet, logCallback) {

    var _this = this;
    var _traceSoName = 'libFKGTrace.so';
    var _isTracing = false;
    var _loaded = false;

    // Native function pointers (lazy load)
    var _init = null;
    var _run = null;
    var _unrun = null;

    // 地址映射配置指针 & NativeCallback 引用（防止 GC）
    var _addrConfigPtr = null;
    var _cbRefs = [];

    // Hook 的目标地址
    var _traceAddr = null;

    // ============================================================
    // CpuContext — GumCpuContext (ARM64) 包装类
    // ============================================================
    function CpuContext(ctxPtr) {
        if (!(this instanceof CpuContext))
            return new CpuContext(ctxPtr);
        this._ptr = ctxPtr;

        var O = CpuContext;
        if (!O.Offset) {
            O.Offset = { pc: 0, sp: 8, nzcv: 16, x: 24, fp: 256, lr: 264, v: 272, SIZE: 784 };

            O.readReg = function (c, n, i) {
                var b = O.Offset[n];
                if (b === undefined) throw new Error('Unknown register: ' + n);
                return c.add(i !== undefined ? b + i * (n === 'v' ? 16 : 8) : b).readPointer();
            };

            O.writeReg = function (c, n, i, v) {
                var b = O.Offset[n];
                if (b === undefined) throw new Error('Unknown register: ' + n);
                c.add(i !== undefined ? b + i * (n === 'v' ? 16 : 8) : b).writePointer(v);
            };

            O.readVectorReg = function (c, i) {
                if (i < 0 || i > 31) throw new Error('v index must be 0-31');
                return c.add(O.Offset.v + i * 16).readByteArray(16);
            };

            var regs = ['pc', 'sp', 'nzcv', 'fp', 'lr'];
            for (var j = 0; j <= 28; j++) regs.push('x' + j);
            regs.forEach(function (name) {
                Object.defineProperty(O.prototype, name, {
                    get: function () {
                        var m = name.match(/x(\d+)/);
                        return m ? O.readReg(this._ptr, 'x', parseInt(m[1]))
                            : O.readReg(this._ptr, name);
                    },
                    set: function (val) {
                        var m = name.match(/x(\d+)/);
                        m ? O.writeReg(this._ptr, 'x', parseInt(m[1]), val)
                            : O.writeReg(this._ptr, name, undefined, val);
                    }
                });
            });
        }
    }

    // AddrMapping 结构体定义（与 C++ 侧对齐）
    var AddrMappingEntry = { address: 0, name: 8, module_name: 136, on_enter: 200, on_leave: 208, SIZE: 216 };
    var AddrMappingConfig = { entries: 0, count: 8, SIZE: 12 };

    /**
     * 构建地址映射配置（C 兼容结构体）
     * @param {Array} addrMaps - [{address, name, moduleName, onEnter?, onLeave?}]
     * @returns {{ptr: NativePointer, refs: Array, entriesBuf: NativePointer}}
     */
    function buildAddrMappingConfig(addrMaps) {
        if (!addrMaps || addrMaps.length === 0) return { ptr: ptr(0), refs: [] };

        var E = AddrMappingEntry;
        var entriesBuf = Memory.alloc(E.SIZE * addrMaps.length);
        var refs = [];

        for (var i = 0; i < addrMaps.length; i++) {
            var item = addrMaps[i];
            var entry = entriesBuf.add(i * E.SIZE);

            entry.add(E.address).writePointer(item.address);
            entry.add(E.name).writeUtf8String(item.name);
            entry.add(E.module_name).writeUtf8String(item.moduleName || '');

            if (item.onEnter) {
                (function (cb) {
                    var nativeCb = new NativeCallback(function (ctxPtr, addrVal, writeLogPtr,ctx_pos) {
                        var logStr = cb(new CpuContext(ctxPtr), addrVal,ctx_pos);
                        if (logStr && logStr.length > 0) {
                            var logPtr = Memory.allocUtf8String(logStr);
                            var writeLog = new NativeFunction(writeLogPtr, 'void', ['pointer']);
                            writeLog(logPtr);
                        }
                    }, 'void', ['pointer', 'uint64', 'pointer','int']);
                    refs.push(nativeCb);
                    entry.add(E.on_enter).writePointer(nativeCb);
                })(item.onEnter);
            } else {
                entry.add(E.on_enter).writePointer(ptr(0));
            }

            if (item.onLeave) {
                (function (cb) {
                    var nativeCb = new NativeCallback(function (ctxPtr, addrVal, writeLogPtr,ctx_pos) {
                        var logStr = cb(new CpuContext(ctxPtr), addrVal,ctx_pos);
                        if (logStr && logStr.length > 0) {
                            var logPtr = Memory.allocUtf8String(logStr);
                            var writeLog = new NativeFunction(writeLogPtr, 'void', ['pointer']);
                            writeLog(logPtr);
                        }
                    }, 'void', ['pointer', 'uint64', 'pointer','int']);
                    refs.push(nativeCb);
                    entry.add(E.on_leave).writePointer(nativeCb);
                })(item.onLeave);
            } else {
                entry.add(E.on_leave).writePointer(ptr(0));
            }
        }

        var C = AddrMappingConfig;
        var configBuf = Memory.alloc(C.SIZE);
        configBuf.add(C.entries).writePointer(entriesBuf);
        configBuf.add(C.count).writeInt(addrMaps.length);

        return { ptr: configBuf, refs: refs, entriesBuf: entriesBuf };
    }

    // ============================================================
    // 内部方法
    // ============================================================

    /**
     * 加载 libFKGTrace.so 并获取函数指针
     */
    function loadLibrary() {
        if (_loaded) return;

        let dlopen = new NativeFunction(Module.findGlobalExportByName('dlopen'), 'pointer', ['pointer', 'int'])
        let dlsym = new NativeFunction(Module.findGlobalExportByName('dlsym'), 'pointer', ['pointer', 'pointer'])

        let soHandle = dlopen(Memory.allocUtf8String('/data/local/tmp/' + _traceSoName), 2)
        console.log('FKGTrace loaded:', soHandle)

        // init(const char *module_names,  int thread_id, GUM_OPTIONS* options, AddrMappingConfig* addr_mappings, LogCallback log_callback)
        _init = new NativeFunction(dlsym(soHandle, Memory.allocUtf8String('init')), 'void', ['pointer', 'int', 'pointer', 'pointer', 'pointer'])
        _run = new NativeFunction(dlsym(soHandle, Memory.allocUtf8String('run')), 'void', ['pointer', 'pointer', 'pointer'])
        _unrun = new NativeFunction(dlsym(soHandle, Memory.allocUtf8String('unrun')), 'void', [])

        _loaded = true;
    }

    /**
     * 内部启动 trace
     */
    function traceStart() {
        if (_isTracing) return;

        // 构建地址映射配置
        var config = buildAddrMappingConfig(addrMappings);
        _addrConfigPtr = config.ptr;
        _cbRefs = config.refs;

        // 加载原生库
        loadLibrary();

        // 准备 moduleNames（来自 traceRang.libs）
        var namesStr = (traceRang.libs && traceRang.libs.length > 0) ? traceRang.libs.join(',') : libname;
        var moduleNamesPtr = Memory.allocUtf8String(namesStr);

        // Options 指针
        var optPtr = Memory.alloc(8);
        optPtr.writeU64(traceMode || 0);

        // 日志回调
        var logCbPtr = ptr(0);
        if (logCallback) {
            logCbPtr = logCallback;
        }

        // init(moduleNames, threadId, options, addrMappings, logCallback)
        _init(moduleNamesPtr, 0, optPtr, _addrConfigPtr, logCbPtr);

        // 生成 trace 元数据
        var mod = Process.findModuleByName(libname);
        var mbase = mod.base;
        var traceId = Date.now().toString() + '-' + Math.random().toString(36).substring(2);
        var taskname = libname.replace(/\.so$/, '')+"_g";

        var offsetVal = (typeof traceOffset === 'number') ? traceOffset :
            (traceOffset instanceof NativePointer ? traceOffset : ptr(String(traceOffset)));
        var traceName = offsetVal.toString(16) + '_' + (mbase ? mbase.toString(16) : '0');

        // run(traceId, taskname, traceName)
        _run(
            Memory.allocUtf8String(traceId),
            Memory.allocUtf8String(taskname),
            Memory.allocUtf8String(traceName)
        );

        _isTracing = true;
    }

    /**
     * 内部停止 trace
     */
    function traceStop() {
        if (!_isTracing) return;
        if (_unrun) _unrun();
        _isTracing = false;
    }

    // ============================================================
    // 公开方法（对齐 16 版 StalkerTraceRangeC 结构）
    // ============================================================

    /**
     * 启动跟踪 — 在目标函数上设置 Interceptor.attach
     * 进入时调用 traceStart (load + init + run)，离开时调用 traceStop (unrun)
     */
    this.start = function () {
        var mod = Process.findModuleByName(libname);
        var mbase = mod.base;
        if (!mbase) {
            console.log('[!] FKGTrace: module ' + libname + ' not found');
            return;
        }

        // traceOffset 可以是数字或 NativePointer，统一转为数字后加基址
        var off = (typeof traceOffset === 'number') ? traceOffset :
            (traceOffset instanceof NativePointer ? traceOffset.toUInt32() : parseInt(String(traceOffset), 16));
        _traceAddr = mbase.add(off);

        Interceptor.attach(_traceAddr, {
            onEnter: function (args) {
                if (_isTracing) return;
                if (beginEvent && !beginEvent(args)) return;

                traceStart();
                console.log('[*] startTrace (FKGTrace)');
            },
            onLeave: function (ret) {
                if (!_isTracing) return;

                traceStop();
                console.log('[*] stopTrace (FKGTrace)');
                if (endEvnet) endEvnet(ret);
            }
        });
    };

    /**
     * 停止跟踪 — 手动停止（unrun + revert）
     */
    this.stop = function () {
        traceStop();
        if (_traceAddr) {
            Interceptor.revert(_traceAddr);
        }
    };

    /**
     * 获取当前是否正在跟踪
     */
    this.isTracing = function () {
        return _isTracing;
    };

    // ============================================================
    // 构造函数末尾自动启动（与 16 版 StalkerTraceRangeC 一致）
    // ============================================================
    this.start();
}
