//Fkida公用方法


String.prototype.replaceAll = function (s1, s2) {
    return this.split(s1).join(s2);
}

//获取安卓线程ID

//获取C线程ID
function getCTid() {
    return Process.getCurrentThreadId();
}
//获取进程ID
function getPid() {
    return Process.id;
}

function getAppDataDir() {
    var dataDir = "";
    Java.perform(function () {
        // 通过 Application Context 尝试获取
        var ActivityThread = Java.use('android.app.ActivityThread');
        var app = ActivityThread.currentApplication();
        var ctx = app.getApplicationContext();

        dataDir = ctx.getDataDir().getAbsolutePath();
        var filesDir = ctx.getFilesDir().getAbsolutePath();
        return dataDir;
    });
    return dataDir;
}
function exits_file(path) {
    var F_OK = 0;
    var accessPtr = Module.findExportByName(null, 'access') || Module.findExportByName('libc.so', 'access');
    var accessFn = new NativeFunction(accessPtr, 'int', ['pointer', 'int']);
    var pptr = Memory.allocUtf8String(path);
    if (accessFn(pptr, F_OK) === 0) {
        return true;
    }
    return false;
}
function MKDir(dirPath) {
    try {
        if (!dirPath) return false;
        // 规范化：去掉末尾多余斜杠（保留根目录 "/")
        if (dirPath.length > 1) {
            dirPath = dirPath.replace(/\/+$/, '');
        }
        // 本地方式：逐级创建目录，使用 access 检查存在性，使用 mkdir 创建
        var accessPtr = Module.findExportByName(null, 'access') || Module.findExportByName('libc.so', 'access');
        var mkdirPtr = Module.findExportByName(null, 'mkdir') || Module.findExportByName('libc.so', 'mkdir');
        if (!accessPtr || !mkdirPtr) return false;

        var accessFn = new NativeFunction(accessPtr, 'int', ['pointer', 'int']);
        var mkdirFn = new NativeFunction(mkdirPtr, 'int', ['pointer', 'int']);
        var F_OK = 0;
        var MODE = 0o755; // rwxr-xr-x

        var parts = dirPath.split('/');
        var cur = dirPath.startsWith('/') ? '/' : '';
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === '') continue;
            if (cur === '/') cur = '/' + parts[i];
            else cur = cur + '/' + parts[i];

            var pptr = Memory.allocUtf8String(cur);
            try {
                if (accessFn(pptr, F_OK) === 0) {
                    continue; // 已存在
                }
            } catch (e) {
                // access 调用失败，尝试 mkdir 也无妨
            }

            try {
                mkdirFn(pptr, MODE);
            } catch (e) {
                // 忽略单次创建失败，后续再次检查
            }
        }

        var finalPtr = Memory.allocUtf8String(dirPath);
        try {
            return accessFn(finalPtr, F_OK) === 0;
        } catch (e) {
            return false;
        }
    } catch (e) {
        try { fKLog.kCLog({ ensureDirExists_error: e.toString(), path: dirPath }); } catch (ee) { }
        return false;
    }
}
function WriteFileRaw(path, arr, flags) {

    try {
        if (!path) return false;

        if (flags == undefined) {
            flags = "w+"
        }
        var O_WRONLY = 1;
        var O_RDWR = 2;
        var O_CREAT = 0x40;
        var O_TRUNC = 0x200;
        var O_APPEND = 0x400;
        switch (flags) {
            case 'a': // append
                flags = O_WRONLY | O_CREAT | O_APPEND;
                break;
            case 'a+': // read/write append
                flags = O_RDWR | O_CREAT | O_APPEND;
                break;
            case 'w': // truncate write
                flags = O_WRONLY | O_CREAT | O_TRUNC;
                break;
            case 'w+': // read/write truncate
                flags = O_RDWR | O_CREAT | O_TRUNC;
                break;
            case 'r+': // read/write
                flags = O_RDWR;
                break;
            case 'r': // read only (fallback to open read)
                flags = 0; // O_RDONLY == 0
                break;
            default:
                return false;
        }
        // 导出底层函数
        var openPtr = Module.getExportByName(null, 'open');
        var writePtr = Module.getExportByName(null, "write");
        var closePtr = Module.getExportByName(null, 'close');
        if (!openPtr || !writePtr || !closePtr) {
            fKLog.kCLog({ appendFileRaw_error: "missing libc functions" });
            return false;
        }
        // open 有时声明为 (const char*, int) 或 (const char*, int, mode_t)
        var open = new NativeFunction(openPtr, 'int', ['pointer', 'int', 'int']);
        var write = new NativeFunction(writePtr, "int", ["int", "pointer", "int"]);
        var close = new NativeFunction(closePtr, 'int', ['int']);

        var pathPtr = Memory.allocUtf8String(path);


        var fd = open(pathPtr, flags, 0x1A4);
        if (fd === -1 || fd === 0) {
            fKLog.kCLog("appendFileRaw open fail " + path + " fd=" + fd);
            return false;
        }

        // 规范化输入：支持 Uint8Array / ArrayBuffer / TypedArray / string / 普通数组
        var u8 = null;
        if (arr == null) {
            try { close(fd); } catch (e) { }
            return true;
        } else if (arr instanceof Uint8Array) {
            u8 = arr;
        } else if (ArrayBuffer.isView(arr)) {
            u8 = new Uint8Array(arr.buffer, arr.byteOffset || 0, arr.byteLength || arr.length);
        } else if (arr instanceof ArrayBuffer) {
            u8 = new Uint8Array(arr);
        } else if (typeof arr === 'string') {
            var ba = [];
            for (var i = 0; i < arr.length; i++)
                ba.push(arr.charCodeAt(i) & 0xff);
            u8 = new Uint8Array(ba);
        } else if (Array.isArray(arr)) {
            u8 = new Uint8Array(arr);
        } else {
            fKLog.kCLog("other type");
            return false;
        }

        var total = u8.length;
        if (total === 0) {
            close(fd);
            return true;
        }

        // 分块写入以防一次性写太大
        var written = 0;
        var CHUNK = 1024 * 1024; // 1024KB per write
        while (written < total) {
            var chunkSize = Math.min(CHUNK, total - written);
            var buf = Memory.alloc(chunkSize);
            Memory.writeByteArray(buf, u8.subarray(written, written + chunkSize));
            var n = write(fd, buf, chunkSize);
            if (n === -1 || n === 0) {
                fKLog.kCLog({ appendFileRaw_write_fail: { path: path, wanted: chunkSize, wrote: n } });
                try { close(fd); } catch (e) { }
                return false;
            }
            // n 可能为小于请求的值，循环继续写剩余部分
            written += parseInt(n);
        }

        close(fd);
        return written === total;
    } catch (e) {
        try { fKLog.kCLog({ appendFileRaw_error: e.toString(), path: path }); } catch (ee) { }
        return false;
    }
}
function appendFileRaw(path, arr) {
    return WriteFileRaw(path, arr, "a+");
}
function readFileRaw(path) {

    var openPtr = Module.getExportByName(null, 'open');
    var readPtr = Module.getExportByName(null, "read");
    var closePtr = Module.getExportByName(null, 'close');
    var open = new NativeFunction(openPtr, 'int', ['pointer', 'int']);
    var read = new NativeFunction(readPtr, "int", ["int", "pointer", "int"]);
    var close = new NativeFunction(closePtr, 'int', ['int']);

    var openatPtr = Module.findExportByName(null, 'openat') || Module.findExportByName('libc.so', 'openat');
    var openat = new NativeFunction(openatPtr, 'int', ['int', 'pointer', 'int', 'int']);
    var pathPtr = Memory.allocUtf8String(path);

    var AT_FDCWD = -100;
    var fd = openat(AT_FDCWD, pathPtr, 0, 0);

    //var fd = open(pathPtr, 0); // O_RDONLY
    if (fd === -1 || fd === 0) {
        fKLog.kCLog("readFileRaw " + path + "fd === 0");
        return null;
    }
    //fKLog.kCLog("readFileRaw " + pathPtr.readCString() + "fd === " + fd);

    var chunks = [];
    var total = 0;
    var bufSize = 4096;
    var buf = Memory.alloc(bufSize);
    while (true) {
        var n = read(fd, buf, bufSize);
        if (n === 0 || n === -1) break;
        var ba = ptr(buf).readByteArray(n);
        chunks.push(new Uint8Array(ba));
        total += n;
    }
    try { close(fd); } catch (e) { }

    if (chunks.length === 0) {
        fKLog.kCLog("readFileRaw chunks.length === 0");
        return null;
    }
    if (chunks.length === 1) return chunks[0];

    // 合并多个 chunk
    var out = new Uint8Array(total);
    var off = 0;
    for (var i = 0; i < chunks.length; i++) {
        out.set(chunks[i], off);
        off += chunks[i].length;
    }
    return out;
}
function read_file_string(path) {
    var u8 = readFileRaw(path);
    if (u8 == null)
        return "";

    var len = u8.length;
    var end = len;
    for (var i = 0; i < len; i++) {
        if (u8[i] === 0) { end = i; break; }
    }

    if (end === 0) return "";

    // 构造字符串（proc 文件常为 ASCII/UTF-8，逐字节转足够可靠）
    var parts = [];
    // 分块避免 apply 调用长度限制
    var CHUNK = 1024;
    for (var off = 0; off < end; off += CHUNK) {
        var slice = u8.subarray(off, Math.min(end, off + CHUNK));
        var strPart = "";
        for (var j = 0; j < slice.length; j++) strPart += String.fromCharCode(slice[j]);
        parts.push(strPart);
    }
    return parts.join("");
}
var popen, pclose, fgets = null;
function runPopen(cmd, opts) {
    try {
        if (!cmd) return null;
        opts = opts || {};
        var bufSize = opts.bufSize || 1024;
        var maxLines = opts.maxLines || 1; // 读取行数，默认只读第一行
        if (!popenPtr || !pclosePtr || !fgetsPtr) {
            var popenPtr = Module.findExportByName(null, "popen") || Module.findExportByName("libc.so", "popen");
            var pclosePtr = Module.findExportByName(null, "pclose") || Module.findExportByName("libc.so", "pclose");
            var fgetsPtr = Module.findExportByName(null, "fgets") || Module.findExportByName("libc.so", "fgets");

            popen = new NativeFunction(popenPtr, "pointer", ["pointer", "pointer"]);
            pclose = new NativeFunction(pclosePtr, "int", ["pointer"]);
            fgets = new NativeFunction(fgetsPtr, "pointer", ["pointer", "int", "pointer"]);
        }

        var modePtr = Memory.allocUtf8String("r");
        var cmdPtr = Memory.allocUtf8String(cmd);
        var fp = null;
        fp = popen(cmdPtr, modePtr);
        if (ptr(fp).isNull())
            return null;

        var buf = Memory.alloc(bufSize);
        var lines = [];
        while (true) {
            var rv = null;
            try {
                rv = fgets(buf, bufSize, fp);
            } catch (e) {
                rv = ptr(0);
            }
            if (ptr(rv).isNull()) {
                //fKLog.kCLog("popen=>" + cmd + " break");
                break;
            }
            var s = Memory.readUtf8String(buf) || "";
            //fKLog.kCLog("popen=>" + s + "=>" + maxLines);
            lines.push(s.trim());
            if (lines.length >= maxLines)
                break;
        }
        return lines;
    } catch (e) {
        fKLog.kCLog({ runPopen_error: e.toString(), cmd: cmd });
        return null;
    }
}
function get_processname_bypid(pid) {
    var out = runPopen("ps -p " + pid + " -o name", { bufSize: 512, maxLines: 100 });
    if (out) {
        if (out.length <= 1) {
            return "";//没有权限查询
        }
        return out[1];
    }
    return "";
}
function get_pid_byprocessname(name) {
    var lines = runPopen("busybox pidof " + name, { bufSize: 2048, maxLines: 100 });
    if (lines) {
        var pids = [];
        for (var i = 0; i < lines.length; i++) {
            var v = parseInt(lines[i], 10);
            if (!isNaN(v)) {
                pids.push(v);
            }
        }
        if (pids.length > 0)
            return pids[0];
    }
    return "";
}
/**
 * 读取指针数据返回hex字符串
 * @param {any} ptr
 * @param {any} size
 */
function readHex(ptr, size) {
    return fkConvert.bytesToHex(new Uint8Array(ptr.readByteArray(size - 0)))
}
function readBase64(ptr, size) {
    return fkConvert.bytesToBase64(new Uint8Array(ptr.readByteArray(size - 0)))
}
/**
 * 多级指针
 * @param {any} express
 * @param {any} log
 */
function readMultPoint(baseptr, express, log) {
    if (log == undefined || log == false)
        log = false;
    else
        log = true;
    //readMultPoint(`${mbase.toString(16)}+0x22E4E0]]+0x10]+0x8]]+0x10]+0x8]]+0x10]+0x8]]]+0x48]]`)
    //console.log(`readpoint begin ${express}`);
    var items = express.split(']')
    var offsetList = [];
    var readstr = "";
    for (var i = 0; i < items.length; i++) {
        if (i != 0) {
            var p = baseptr;
            baseptr = p.readPointer();
            readstr += "]";
            if (log)
                console.log(`readMultPoint point=${p} express=${readstr}  result=${baseptr}`);
        }
        var items2 = items[i].split('+');
        var offset = 0;
        for (var j = 0; j < items2.length; j++) {
            if (items2[j] == "")
                continue;
            offset += parseInt(items2[j], 16);
        }
        baseptr = baseptr.add(offset);
        offsetList.push(offset);
        readstr += items[i];
    }
    return baseptr;
}
/*
 * Note: Only compatible with libc++, though libstdc++'s std::string is a lot simpler.
 */
function readStdString(str) {
    const isTiny = (str.readU8() & 1) === 0;
    if (isTiny) {
        return str.add(1).readUtf8String();
    }

    return str.add(2 * Process.pointerSize).readPointer().readUtf8String();
}

function readStdHex(str) {
    const isTiny = (str.readU8() & 1) === 0;
    if (isTiny) {
        return readHex(str.add(2 * Process.pointerSize).readPointer(), 128);
    }

    var size = str.add(1 * Process.pointerSize).readInt()
    if (size > 1024)
        size = 1024;

    return readHex(str.add(2 * Process.pointerSize).readPointer(), size);
}
function writeStdString(str, data) {
    const isTiny = (str.readU8() & 1) === 0;
    if (isTiny) {
        return str.add(1).writeUtf8String(data);
    }

    return str.add(2 * Process.pointerSize).readPointer().writeUtf8String(data);
}
// 解析 sockaddr 内容（支持 AF_INET / AF_INET6 / AF_UNIX）
function parseSockaddr(addrPtr, addrLen) {
    function ipv4FromBytes(u8, off) {
        return (u8[off] & 0xFF) + '.' + (u8[off + 1] & 0xFF) + '.' + (u8[off + 2] & 0xFF) + '.' + (u8[off + 3] & 0xFF);
    }
    function ipv6FromBytes(u8, off) {
        var parts = [];
        for (var i = 0; i < 16; i += 2) {
            parts.push(('' + (((u8[off + i] & 0xff) << 8) | (u8[off + i + 1] & 0xff)).toString(16)));
        }
        return parts.join(':').replace(/(^|:)0(:0)*:0(:|$)/, '::'); // best-effort shorten
    }

    try {
        if (!addrPtr || addrPtr.isNull() || !addrLen)
            return null;
        var n = Math.min(addrLen, 256);
        var ba = Memory.readByteArray(addrPtr, n);
        if (!ba) {
            console.log("parseSockaddr ba ==null")
            return null;
        }
        var u8 = new Uint8Array(ba);

        // sa_family 在偏移 0（uint16，小端机器）
        var family = (u8[0] & 0xff) | ((u8[1] & 0xff) << 8);
        var res = { family: family };

        if (family === 2) { // AF_INET
            // struct sockaddr_in: family:uint16, port:uint16 (network), addr:uint32 (network)
            var port = ((u8[2] & 0xff) << 8) | (u8[3] & 0xff); // network order
            var ip = ipv4FromBytes(u8, 4);
            res.familyName = 'AF_INET';
            res.port = port;
            res.ip = ip;
            res.raw = fkConvert.bytesToHex(ba);
            return res;
        } else if (family === 10) { // AF_INET6
            // family:uint16, port:uint16 (network) at offset2, flowinfo:uint32 off4, addr[16] at off8
            var port6 = ((u8[2] & 0xff) << 8) | (u8[3] & 0xff);
            var ip6 = ipv6FromBytes(u8, 8);
            res.familyName = 'AF_INET6';
            res.port = port6;
            res.ip = ip6;
            res.raw = fkConvert.bytesToHex(ba);
            return res;
        } else if (family === 1) { // AF_UNIX
            // struct sockaddr_un: family:uint16, path at offset2 (NUL-terminated)
            var path = '';
            for (var i = 2; i < u8.length; i++) {
                if (u8[i] === 0) break;
                path += String.fromCharCode(u8[i]);
            }
            res.familyName = 'AF_UNIX';
            res.path = path;
            res.raw = fkConvert.bytesToHex(ba);
            return res;
        } else {
            res.familyName = 'AF_' + family;
            res.raw = fkConvert.bytesToHex(ba);
            return res;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}
function fdToPath(fd) {
    try {
        if (fd === undefined || fd === null) return null;
        fd = parseInt(fd);
        if (isNaN(fd)) return null;

        // 构造路径 "/proc/self/fd/<fd>"
        var procPath = '/proc/self/fd/' + fd;
        var pProcPath = Memory.allocUtf8String(procPath);

        // 分配缓冲区读取链接
        var bufSize = 1024;
        var buf = Memory.alloc(bufSize);

        // 找到 readlink 导出（兼容不同 libc）
        var readlinkPtr = Module.findExportByName(null, 'readlink') || Module.findExportByName('libc.so', 'readlink');
        if (!readlinkPtr) return null;

        var readlink = new NativeFunction(readlinkPtr, 'int', ['pointer', 'pointer', 'int']);

        var len = readlink(pProcPath, buf, bufSize);
        if (len <= 0) return null;

        // 读取指定长度的字符串
        var path = Memory.readUtf8String(buf, len);
        return path;
    } catch (e) {
        try { fKLog.kCLog({ fdToPath_error: e }); } catch (ee) { }
        return null;
    }
}


let call_count = {};
function HookAddress(name, address, argcount, showcount, isshow) {
    fKLog.kLog({ name: name, address: address, header: fkConvert.bytesToHex(new Uint8Array(address.readByteArray(20))) });
    Interceptor.attach(address, {
        onEnter: function (args) {
            this.argarrary = [];
            for (var i = 0; i < argcount; i++) {
                this["arg" + i] = args[i];
                this.argarrary.push(this["arg" + i]);
            }
            if (call_count[name] == null)
                call_count[name] = 0;

            call_count[name]++;
            if (call_count[name] < 5 || showcount == -1) {
                this.logs = {};
                this.logs["name"] = name;
                var enter = {};
                for (var i = 0; i < this.argarrary.length; i++) {
                    var key = "arg" + (i + 1);
                    try {
                        enter[key] = {}
                        enter[key].str = this.argarrary[i].readCString();
                        enter[key].hex = fkConvert.bytesToHex(new Uint8Array(this.argarrary[i].readByteArray(20)));
                    }
                    catch {
                        enter[key] = this.argarrary[i];
                    }
                }
                this.logs["enter"] = enter;
            }
        }, onLeave: function (retval) {
            var arrary = [retval];
            for (var i = 0; i < this.argarrary.length; i++) {
                arrary.push(this.argarrary[i]);
            }
            var leave = {};
            for (var i = 0; i < arrary.length; i++) {
                var key = "arg" + i;
                if (i == 0) {
                    key = "retVal";
                }
                try {
                    leave[key] = {}
                    leave[key].str = arrary[i].readCString();
                    leave[key].hex = fkConvert.bytesToHex(new Uint8Array(arrary[i].readByteArray(20)));
                }
                catch {
                    leave[key] = arrary[i];
                }
            }
            this.logs["leave"] = leave;
            if (isshow == undefined || isshow())
                fKLog.kCLog(this.logs, this.context)
        }
    });
}

/**
 * 启动hook so
 * @param {any} library_name
 * @param {any} onenter
 * @param {any} onleave
 */
function spawn_hook_so(library_name, onenter, onleave) {
    Interceptor.attach(Module.findExportByName(null, 'android_dlopen_ext'), {
        onEnter: function (args) {
            this.library_path = Memory.readCString(args[0])
            if (this.library_path.includes(library_name)) {
                if (onenter != undefined) {
                    onenter(this.library_path);
                }
                this.library_loaded = 1
            }
        },
        onLeave: function (args) {
            if (this.library_loaded == 1) {
                if (onleave != undefined) {
                    var module = Process.findModuleByName(library_name);
                    onleave(this.library_path, module);
                }
                this.library_loaded = 0
            }
        }
    })
}

//打印指令
function printInstructions(base, offset, number) {
    var inss = [];
    var address = base.add(offset);
    for (var i = 0; i < number; i++) {
        var ins = Instruction.parse(address);
        inss.push(ptr(address) + "   " + ins.toString())
        offset += (ins.next - address);
        address = ins.next;
    }
    fKLog.kLog({ name: "ins", inss: inss });
}
function patchAddressCode(modelbase, offset, code) {
    var address = modelbase.add(offset);
    //fKLog.kLog("+++++++++++patch " + address + "++++++++++++ pre")
    //if (code.length == 2)
    //    printInstructions(modelbase, address.add(1), 10);
    //else
    //    printInstructions(modelbase, address, 10);
    Memory.protect(address, 32, 'rwx');
    address.writeByteArray(code);
    //fKLog.kLog("+++++++++++patch " + address + "++++++++++++ over")
    //if (code.length == 2)
    //    printInstructions(modelbase, address.add(1), 10);
    //else
    //    printInstructions(modelbase, address, 10);
}
function patchModelCode(moduleName, offset, code) {
    //fKLog.kLog({ name: "patchModelCode", moduleName: moduleName, offset: offset, code: code });
    var module = Process.getModuleByName(moduleName);
    var base = module.base;
    patchAddressCode(base, offset, code)
}

function NOPAddress(modelbase, offset) {
    patchAddressCode(modelbase, offset, [0x1F, 0x20, 0x3, 0xD5]);
}
class StdString {
    //const STD_STRING_SIZE = 3 * Process.pointerSize;
    constructor(handle) {
        if (handle == undefined || handle == null)
            this.handle = Memory.alloc(1024);
        else {
            this.handle = handle;
        }
        this.oldp = null;
    }
    dispose() {

    }
    getHandle() {
        return this.handle;
    }
    disposeToString() {
        const result = this.toString();
        if (this.oldp != null)
            this.handle.add(2 * Process.pointerSize).writePointer(this.oldp)
        this.dispose();
        return result;
    }

    toString() {
        const [data] = this._getData();
        return data.readUtf8String();
    }

    _getData() {
        const str = this.handle;
        const isTiny = (str.readU8() & 1) === 0;
        const data = isTiny ? str.add(1) : str.add(2 * Process.pointerSize).readPointer();
        return [data, isTiny];
    }
    writeString(str) {
        const [ptr, istiny] = this._getData()

        if (!istiny) {
            if (this.p1 == null)
                this.oldp = ptr;
        }

        var data = fkConvert.hexToBytes(fkConvert.stringToHex(str));
        this.p2 = Memory.alloc(data.length + 100);

        this.handle.writeU8(1);
        this.handle.add(Process.pointerSize).writeInt(data.length)
        this.handle.add(2 * Process.pointerSize).writePointer(this.p2)
        this.p2.writeByteArray(data);
    }
}


/**
 * 检测地址是否是thumb指令
 * @param {NativePointer} pc_addr 
 * @returns 是否为thumb,true为thunb,false不是thumb
 * fixme 因为pc拿到的地址恒为偶数，所以不得不用lr来判断
 */
function check_pc_thumb(pc_addr) {
    return (pc_addr % 2 == 1)
}


/**
 * 设置内存保护模式
 * @param {int} addr 
 * @param {string} flag
 */
function setPageProtect(addr, flag) {
    return setPageProtectSize(addr, flag, Process.pageSize);
}
function setPageProtectSize(addr, flag, size) {
    var oldprotect = getPageProtect(addr);
    Memory.protect(ptr(addr), size, flag)
    return oldprotect;
}
/**
 * 获取内存保护模式
 * @param {int} addr
 */
function getPageProtect(addr) {
    var pages = Process.enumerateRanges("---");
    for (var i = 0; i < pages.length; i++) {
        if (addr > pages[i].base && addr < pages[i].base.add(pages[i].size)) {
            return pages[i].protection;
        }
    }
    return "";
}
/**
 * 获取下一条指令地址
 * @param {NativePointer} pc_addr 当前指令地址
 * @returns {NativePointer} 下一条指令地址
 */
function GetNextInsAddr(pc_addr) {
    //如果是thumb指令集地址加1，arm和arm64指令集不需要加1
    if (check_pc_thumb(pc_addr)) {
        pc_addr = pc_addr.add(1)
    }
    //获取当前指令长度
    const size = Instruction.parse(pc_addr).size;
    //把要写的断点移到下个条指令
    let nextpc_addr = pc_addr.add(size)
    return nextpc_addr;
}
/**
 * 获取地址指令
 * @param {any} pc_addr
 */
function GetIns(pc_addr) {
    let _pc = ptr(pc_addr);
    if (check_pc_thumb(_pc)) {
        _pc = _pc.add(1)
    }
    var ins = Instruction.parse(_pc);
    return { ins: ins, nextAddr: _pc.add(ins.size) };
}

function SettingsSystem() {
    var SettingsSystem = Java.use('android.provider.Settings$System');
    var appContext = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();
    this.putString = function (key, value) {
        SettingsSystem.putString.call(SettingsSystem, appContext.getContentResolver(), key, value);
    }
    this.remove = function (key) {
        SettingsSystem.putString.call(SettingsSystem, appContext.getContentResolver(), key, null);
    }
    this.getString = function (key) {
        return SettingsSystem.getString.call(SettingsSystem, appContext.getContentResolver(), key);
    }
}

function getApkSignature(packageName) {
    const signature = Java.vm.getPackageSignature(packageName);
    console.log(`签名信息: ${signature}`);
}
var jave_vm_Env = null;
function get_jave_vm_Env() {
    if (jave_vm_Env == null) {
        fKLog.kCLog("get_jave_vm_Env 11111111");
        jave_vm_Env = Java.vm.getEnv();
        fKLog.kCLog("get_jave_vm_Env 2222222222");
    }
    return jave_vm_Env;
}

function GetJniAddress() {

    var java_env = get_jave_vm_Env();
    var libart = Process.findModuleByName("libart.so");
    var jni_struct_array = [
        "reserved0", "reserved1", "reserved2", "reserved3", "GetVersion", "DefineClass",
        "FindClass", "FromReflectedMethod", "FromReflectedField", "ToReflectedMethod", "GetSuperclass",
        "IsAssignableFrom", "ToReflectedField", "Throw", "ThrowNew", "ExceptionOccurred", "ExceptionDescribe",
        "ExceptionClear", "FatalError", "PushLocalFrame", "PopLocalFrame", "NewGlobalRef", "DeleteGlobalRef",
        "DeleteLocalRef", "IsSameObject", "NewLocalRef", "EnsureLocalCapacity", "AllocObject", "NewObject",
        "NewObjectV", "NewObjectA", "GetObjectClass", "IsInstanceOf", "GetMethodID", "CallObjectMethod",
        "CallObjectMethodV", "CallObjectMethodA", "CallBooleanMethod", "CallBooleanMethodV", "CallBooleanMethodA",
        "CallByteMethod", "CallByteMethodV", "CallByteMethodA", "CallCharMethod", "CallCharMethodV", "CallCharMethodA",
        "CallShortMethod", "CallShortMethodV", "CallShortMethodA", "CallIntMethod", "CallIntMethodV", "CallIntMethodA",
        "CallLongMethod", "CallLongMethodV", "CallLongMethodA", "CallFloatMethod", "CallFloatMethodV", "CallFloatMethodA",
        "CallDoubleMethod", "CallDoubleMethodV", "CallDoubleMethodA", "CallVoidMethod", "CallVoidMethodV", "CallVoidMethodA",
        "CallNonvirtualObjectMethod", "CallNonvirtualObjectMethodV", "CallNonvirtualObjectMethodA", "CallNonvirtualBooleanMethod", "CallNonvirtualBooleanMethodV",
        "CallNonvirtualBooleanMethodA", "CallNonvirtualByteMethod", "CallNonvirtualByteMethodV", "CallNonvirtualByteMethodA", "CallNonvirtualCharMethod",
        "CallNonvirtualCharMethodV", "CallNonvirtualCharMethodA", "CallNonvirtualShortMethod", "CallNonvirtualShortMethodV", "CallNonvirtualShortMethodA",
        "CallNonvirtualIntMethod", "CallNonvirtualIntMethodV", "CallNonvirtualIntMethodA", "CallNonvirtualLongMethod", "CallNonvirtualLongMethodV",
        "CallNonvirtualLongMethodA", "CallNonvirtualFloatMethod", "CallNonvirtualFloatMethodV", "CallNonvirtualFloatMethodA", "CallNonvirtualDoubleMethod",
        "CallNonvirtualDoubleMethodV", "CallNonvirtualDoubleMethodA", "CallNonvirtualVoidMethod", "CallNonvirtualVoidMethodV",
        "CallNonvirtualVoidMethodA", "GetFieldID", "GetObjectField", "GetBooleanField",
        "GetByteField", "GetCharField", "GetShortField", "GetIntField",
        "GetLongField", "GetFloatField", "GetDoubleField", "SetObjectField",
        "SetBooleanField", "SetByteField", "SetCharField", "SetShortField",
        "SetIntField", "SetLongField", "SetFloatField", "SetDoubleField",
        "GetStaticMethodID", "CallStaticObjectMethod", "CallStaticObjectMethodV", "CallStaticObjectMethodA",
        "CallStaticBooleanMethod", "CallStaticBooleanMethodV", "CallStaticBooleanMethodA", "CallStaticByteMethod",
        "CallStaticByteMethodV", "CallStaticByteMethodA", "CallStaticCharMethod", "CallStaticCharMethodV", "CallStaticCharMethodA", "CallStaticShortMethod",
        "CallStaticShortMethodV", "CallStaticShortMethodA", "CallStaticIntMethod", "CallStaticIntMethodV",
        "CallStaticIntMethodA", "CallStaticLongMethod", "CallStaticLongMethodV", "CallStaticLongMethodA",
        "CallStaticFloatMethod", "CallStaticFloatMethodV", "CallStaticFloatMethodA", "CallStaticDoubleMethod",
        "CallStaticDoubleMethodV", "CallStaticDoubleMethodA", "CallStaticVoidMethod", "CallStaticVoidMethodV",
        "CallStaticVoidMethodA", "GetStaticFieldID", "GetStaticObjectField", "GetStaticBooleanField",
        "GetStaticByteField", "GetStaticCharField", "GetStaticShortField", "GetStaticIntField",
        "GetStaticLongField", "GetStaticFloatField", "GetStaticDoubleField", "SetStaticObjectField",
        "SetStaticBooleanField", "SetStaticByteField", "SetStaticCharField", "SetStaticShortField",
        "SetStaticIntField", "SetStaticLongField", "SetStaticFloatField", "SetStaticDoubleField",
        "NewString", "GetStringLength", "GetStringChars", "ReleaseStringChars",
        "NewStringUTF", "GetStringUTFLength", "GetStringUTFChars", "ReleaseStringUTFChars",
        "GetArrayLength", "NewObjectArray", "GetObjectArrayElement", "SetObjectArrayElement",
        "NewBooleanArray", "NewByteArray", "NewCharArray", "NewShortArray",
        "NewIntArray", "NewLongArray", "NewFloatArray", "NewDoubleArray",
        "GetBooleanArrayElements", "GetByteArrayElements", "GetCharArrayElements", "GetShortArrayElements",
        "GetIntArrayElements", "GetLongArrayElements", "GetFloatArrayElements", "GetDoubleArrayElements",
        "ReleaseBooleanArrayElements", "ReleaseByteArrayElements", "ReleaseCharArrayElements", "ReleaseShortArrayElements",
        "ReleaseIntArrayElements", "ReleaseLongArrayElements", "ReleaseFloatArrayElements", "ReleaseDoubleArrayElements",
        "GetBooleanArrayRegion", "GetByteArrayRegion", "GetCharArrayRegion", "GetShortArrayRegion",
        "GetIntArrayRegion", "GetLongArrayRegion", "GetFloatArrayRegion", "GetDoubleArrayRegion",
        "SetBooleanArrayRegion", "SetByteArrayRegion", "SetCharArrayRegion", "SetShortArrayRegion",
        "SetIntArrayRegion", "SetLongArrayRegion", "SetFloatArrayRegion", "SetDoubleArrayRegion",
        "RegisterNatives", "UnregisterNatives", "MonitorEnter", "MonitorExit",
        "GetJavaVM", "GetStringRegion", "GetStringUTFRegion", "GetPrimitiveArrayCritical",
        "ReleasePrimitiveArrayCritical", "GetStringCritical", "ReleaseStringCritical", "NewWeakGlobalRef",
        "DeleteWeakGlobalRef", "ExceptionCheck", "NewDirectByteBuffer", "GetDirectBufferAddress", "GetDirectBufferCapacity", "GetObjectRefType"
    ]

    var jnienv_addr = java_env.handle.readPointer();
    var jniAddress = []
    for (var i = 0; i < jni_struct_array.length; i++) {
        var func_name = jni_struct_array[i];
        if (func_name.includes("reserved")) {
            continue;
        }

        var offset = i * Process.pointerSize;
        var func_addr = Memory.readPointer(jnienv_addr.add(offset));
        jniAddress.push({ name: func_name, address: func_addr, offset: func_addr.sub(libart.base) })
    }
    return jniAddress;
}


var lib_base_cache = {};
function IsLibAddr(libname, addr) {
    if (lib_base_cache[libname] == null)
        lib_base_cache[libname] = Process.findModuleByName(libname);
    var libso = lib_base_cache[libname];
    if (libso == null)
        return false;
    if (libso.base < addr && libso.base.add(libso.size) > addr) {
        return true;
    }
    return false;
}

function get_self_process_name() {
    var path = Memory.allocUtf8String("/proc/" + getPid() + "/cmdline");
    var fd = libcNative.open(path, 0);
    if (fd != -1) {
        var buffer = Memory.alloc(0x1000);
        var result = libcNative.read(fd, buffer, 0x1000);
        libcNative.close(fd);
        result = ptr(buffer).readCString();
        return result;
    }
    return "-1";
}

function TrackCFuncStatistics() {

    setTimeout(showfuncCounter, 10 * 1000);

    var funcTrack = [];
    var funcCounter = {};
    var funccount = 0;
    var stoptrace = false;
    var funccountShowCount = 0;
    function showfuncCounter() {
        setTimeout(showfuncCounter, 10 * 1000);
        var fc1 = {};
        var fc2 = {};
        var fc3 = {};
        var fc4 = {};
        var fc5 = {};
        var keys = [];
        if (funccountShowCount == funccount)
            return;
        funccountShowCount = funccount
        for (var key in funcCounter) {
            if (funcCounter[key] > 1000) {
                fc1[key] = funcCounter[key];
            } else if (funcCounter[key] > 100) {
                fc3[key] = funcCounter[key];
            } else if (funcCounter[key] > 10) {
                fc4[key] = funcCounter[key];
            } else {
                fc5[key] = funcCounter[key];
            }
            keys.push(key)
        }
        var str = "0x" + keys.join(",0x", keys);
        fKLog.kCLog({ fc1: fc1, fc2: fc2, fc3: fc3, fc4: fc4, fc5: fc5, funccount: funccount, func: str });

    }
    var str_tab = [];
    function getTab(t) {
        if (t > 20)
            t = 20;
        if (str_tab[t] == null) {
            var str = "";
            for (var i = 0; i < t; i++) {
                str += " ";
            }
            str_tab[t] = str;
        }
        return str_tab[t];
    }
    function TrackAddress(address, offset, tid) {
        var str_offset = offset.toString(16);
        //fKLog.kCLog(str_offset);
        Interceptor.attach(address, {
            onEnter: function (args) {
                // fKLog.kCLog(str_offset);
                var t = getCTid();
                if (tid != undefined && t != tid)
                    return;
                if (funcTrack[t] == undefined) {
                    funcTrack[t] = {};
                    funcTrack[t].tab = 0;
                    funcTrack[t].stack = [];
                }
                if (stoptrace) {
                    Interceptor.revert(address);
                    return;
                }
                this.tid = t;

                funccount++;
                if (funcCounter[str_offset] == null) {
                    funcCounter[str_offset] = 0;
                    //console.log({ name: "Track", offset: str_offset, tab: funcTrack[this.tid].tab });
                }
                funcCounter[str_offset]++;
                //if (funccount % 10000 == 0) {
                //    showfuncCounter();
                //}
                funcTrack[this.tid].stack.push(getTab(funcTrack[this.tid].tab) + str_offset + ":" + funcCounter[str_offset]);
                funcTrack[this.tid].tab++;
            },
            onLeave: function (retval) {
                if (this.tid == undefined || funcTrack[this.tid].tab == 0)
                    return;
                funcTrack[this.tid].tab--;
                if (funcTrack[this.tid].tab == 0) {
                    //showfuncCounter();
                    fKLog.kLog({ tid: this.tid, stack: funcTrack[this.tid].stack })
                    funcTrack[this.tid].stack = [];
                }
            }
        });
    }
    this.Track = function (mbase, tid, trackfunc) {

        for (var i = 0; i < trackfunc.length; i++) {
            try {
                TrackAddress(mbase.add(trackfunc[i]), trackfunc[i], tid);
            }
            catch {
            }
        }
    }
    this.stop = function () {
        stoptrace = true;
    }
}

function dumpso(name, size) {
    var libart = Process.getModuleByName(name);

    if (size == undefined)
        size = libart.size;

    fKLog.kCLog({ name: name, lib: libart, size: size });
    var dex_buffer = ptr(libart.base).readByteArray(size);
    fKLog.kCLogName({ name: name, base: libart.base, size: size }, null, "dumpso", dex_buffer);
}
function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data. At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}

/*
反调试暴力退出
MOV             X0, #0
MOV             X29, X0
MOV             SP, X0
MOV             X30, X0
BR              X30  
*/
/*
反Stalker.follow
LDAXP           X20, X22, [X8]
STXP            W9, X20, X22, [X8]
CBNZ            W9, loc_21D890

v8::FunctionTemplate::New
*/

function extractSoFromApkBytes(apkPath, innerPath) {
    if (!apkPath || !innerPath) throw "apkPath and innerPath required";
    if (innerPath.charAt(0) === '/')
        innerPath = innerPath.substring(1);
    var result = null;
    var ZipFile = Java.use('java.util.zip.ZipFile');
    var ByteArrayOutputStream = Java.use('java.io.ByteArrayOutputStream');
    var FileOutputStream = Java.use('java.io.FileOutputStream');
    var File = Java.use('java.io.File');
    var zf = ZipFile.$new(apkPath);

    var entry = zf.getEntry(innerPath);
    if (entry == null) {
        var basename = innerPath.split('/').pop();
        var entries = zf.entries();
        while (entries.hasMoreElements()) {
            var e = entries.nextElement();
            var name = e.getName();
            // 尽可能多的匹配策略：完整匹配 / 结尾匹配 / 仅文件名匹配
            if (name === innerPath || name.endsWith('/' + innerPath) || name.endsWith(innerPath) || name.endsWith('/' + basename) || name === basename) {
                entry = e;
                break;
            }
        }
    }

    if (entry == null) {
        try { zf.close(); } catch (ee) { }
        throw "zip entry not found: " + innerPath;
    }


    var is = zf.getInputStream(entry);
    var baos = ByteArrayOutputStream.$new();
    var buf = Java.array('byte', Array(8192).fill(0));
    while (true) {
        var r = is.read(buf);
        if (r === -1 || r === 0) break;
        baos.write(buf, 0, r);

    }
    var outPath = getAppDataDir() + "/ziptmp.bin"
    var f = File.$new(outPath);
    try {

        var parent = f.getParentFile();
        if (parent !== null && !parent.exists())
            parent.mkdirs();
    } catch (e) { /* ignore */ }

    // 直接把 baos 写入文件（java 层，零拷贝）
    var fos = FileOutputStream.$new(outPath);
    try {
        baos.writeTo(fos);
        fos.flush();
    } finally {
        try { fos.close(); } catch (e) { }
    }

    try { is.close(); } catch (e) { }
    try { baos.close(); } catch (e) { }
    try { zf.close(); } catch (e) { }

    var u8 = readFileRaw(outPath)

    f.delete();

    return u8
}

//从elf文件 解析section 
function getSectionFromFile(moduleName) {
    if (!moduleName) throw "moduleName required";
    var mod = Process.findModuleByName(moduleName);
    if (!mod) throw "module not loaded: " + moduleName;
    var path = mod.path || "";

    // 读取文件到 native buffer（本函数假定 extractSoFromApkBytes 已返回 Uint8Array 或 readFileRaw 返回 Uint8Array）
    var membuf = null;
    var membufSize = 0;
    if (path.indexOf("!/") !== -1) {
        var parts = path.split("!/");
        var apkPath = parts[0];
        var innerPath = parts.slice(1).join("/");
        var u8 = extractSoFromApkBytes(apkPath, innerPath);
        if (!u8) throw "extract embedded so failed: " + path;
        membufSize = u8.length;
        membuf = Memory.alloc(membufSize);
        Memory.writeByteArray(membuf, u8);
    } else {
        var u8 = readFileRaw(path);
        if (!u8) throw "read file failed: " + path;
        membufSize = u8.length;
        membuf = Memory.alloc(membufSize);
        Memory.writeByteArray(membuf, u8);
    }

    // helpers: read 32/64 at given pointer+offset
    function readU8At(ptrBase, off) { return ptr(ptrBase).add(off).readU8(); }
    function readU16At(ptrBase, off) { return ptr(ptrBase).add(off).readU16(); }
    function readU32At(ptrBase, off) { return ptr(ptrBase).add(off).readU32(); }
    function readU64At(ptrBase, off) { return Number(ptr(ptrBase).add(off).readU64()); }

    // readFromFd for our in-memory buffer
    function readFromBuf(basePtr, off, size) {
        if (!basePtr) return null;
        var p = ptr(basePtr).add(off);
        return p;
    }

    // ELF header
    var ehdr = readFromBuf(membuf, 0, 64);
    if (!ehdr) throw "read ELF header failed";

    // safer magic check
    try {
        var magic = ptr(ehdr).readByteArray(4);
        var mb = new Uint8Array(magic);
        if (mb.length < 4 || mb[0] !== 0x7f || mb[1] !== 0x45 || mb[2] !== 0x4c || mb[3] !== 0x46) {
            throw "not ELF";
        }
    } catch (e) {
        throw "not ELF";
    }

    var ei_class = readU8At(ehdr, 4);
    if (ei_class !== 2) throw "not ELF64";
    var ei_data = readU8At(ehdr, 5);
    if (ei_data !== 1) throw "not little-endian ELF";

    // offsets in ELF64 header
    var e_phoff = readU64At(ehdr, 32);
    var e_shoff = readU64At(ehdr, 40);
    var e_phentsize = readU16At(ehdr, 54);
    var e_phnum = readU16At(ehdr, 56);
    var e_shentsize = readU16At(ehdr, 58);
    var e_shnum = readU16At(ehdr, 60);
    var e_shstrndx = readU16At(ehdr, 62);

    // basic validation
    if (!e_phnum || !e_shnum) {
        return { found: false, reason: "no program/section headers" };
    }

    // read program headers buffer pointer (points into membuf)
    var phdrs_buf = readFromBuf(membuf, e_phoff, e_phentsize * e_phnum);
    if (!phdrs_buf) throw "read phdrs failed";

    var PT_LOAD = 1;
    var phdrs = [];
    // image_base = min(p_vaddr - p_offset) for PT_LOAD entries (更准确地反映文件到虚拟地址的基准)
    var image_base = null;
    for (var i = 0; i < e_phnum; i++) {
        var p = ptr(phdrs_buf).add(i * e_phentsize);
        var p_type = readU32At(p, 0);
        var p_offset = readU64At(p, 8);
        var p_vaddr = readU64At(p, 16);
        var p_filesz = readU64At(p, 32);
        phdrs.push({ p_type: p_type, p_offset: p_offset, p_vaddr: p_vaddr, p_filesz: p_filesz });

        if (p_type === PT_LOAD) {
            // 只考虑实际有数据的段，避免无效段影响计算
            var candidate = p_vaddr - p_offset;
            if (image_base === null || candidate < image_base) image_base = candidate;
        }
    }
    if (image_base === null) image_base = 0;

    // section headers buffer
    if (!e_shoff || !e_shnum) {
        return { found: false, reason: "no section headers in embedded so" };
    }
    var shdrs_buf = readFromBuf(membuf, e_shoff, e_shentsize * e_shnum);
    if (!shdrs_buf) throw "read shdrs failed";

    // read shstrtab (section header string table)
    var shstrtab = null;
    var shstr_offset = 0, shstr_size = 0;
    if (e_shstrndx < e_shnum) {
        var shstr_base = ptr(shdrs_buf).add(e_shstrndx * e_shentsize);
        shstr_offset = readU64At(shstr_base, 24); // sh_offset
        shstr_size = readU64At(shstr_base, 32);   // sh_size
        // Validate bounds
        if (shstr_offset > 0 && shstr_offset + shstr_size <= membufSize) {
            shstrtab = readFromBuf(membuf, shstr_offset, Math.min(shstr_size, 0x100000)); // cap size
        } else {
            shstrtab = null;
        }
    }

    function safeReadStringFromShstr(off) {
        if (!shstrtab || off === 0) return "";
        // ensure offset within shstr_size
        if (off < 0 || off >= shstr_size) return "";
        try {
            return ptr(shstrtab).add(off).readCString();
        } catch (e) {
            return "";
        }
    }

    var sections = [];
    for (var si = 0; si < e_shnum; si++) {
        var s = ptr(shdrs_buf).add(si * e_shentsize);
        var sh_name = readU32At(s, 0);
        var sh_type = readU32At(s, 4);
        var sh_flags = readU64At(s, 8);
        var sh_addr = readU64At(s, 16);
        var sh_offset = readU64At(s, 24);
        var sh_size = readU64At(s, 32);

        // safety: if sh_name points outside shstrtab, don't read it
        var name = "";
        try {
            if (shstrtab && sh_name !== 0 && sh_name < shstr_size) {
                name = safeReadStringFromShstr(sh_name);
            }
        } catch (e) {
            name = "";
        }

        // compute runtime address carefully:
        // only meaningful if sh_addr != 0 and image_base is reasonable
        var runtime_addr = null;
        var runtime_end = null;
        try {
            if (sh_addr && image_base !== null) {
                if (sh_addr > (1n << 48n)) { // heuristic guard
                    runtime_addr = null;
                    runtime_end = null;
                } else {
                    runtime_addr = mod.base.add(sh_addr - image_base);
                    runtime_end = runtime_addr.add(sh_size);
                }
            }
        } catch (e) {
            runtime_addr = null;
            runtime_end = null;
        }

        sections.push({
            name: name,
            sh_type: sh_type,
            sh_flags: sh_flags,
            sh_addr: ptr(sh_addr),
            sh_offset: ptr(sh_offset),
            sh_size: sh_size,
            runtime_addr: runtime_addr,
            runtime_end: runtime_end
        });
    }

    return { found: true, sections: sections, image_base: image_base, module: mod };
}

// 在指定的 .plt 段范围内解析 AArch64 PLT stub 模式（ADRP/ADD/LDR/BR）
// sectionInfo: one of locatePltSection(...).sections[i]
// 返回: [{ plt, got_slot, resolved, symbol, pattern, disasm }]
function getModulePltStubs(moduleName) {

    var sects = getSectionFromFile(moduleName)
    var candidates = sects.sections.filter(function (s) {
        if (!s) return false;
        var n = s.name || "";
        if (n === ".plt") return true;
        return false;
    });
     
    var sectionInfo = candidates[0]
    var maxEntries = 10000;
    var results = [];
    if (!moduleName || !sectionInfo) return results;
    var mod = sects.module;
    if (!mod) return results;

    var start = ptr(sectionInfo.runtime_addr);
    var scanEnd = ptr(sectionInfo.runtime_end);

    function regOfFirst(opStr) {
        if (!opStr) return null;
        return opStr.split(',')[0].trim();
    }
    function parseImm(opStr) {
        if (!opStr) return null;
        var m = opStr.match(/#?-?0x[0-9a-fA-F]+/);
        if (m) return parseInt(m[0].replace(/^#/, ''), 16);
        m = opStr.match(/#?-?\d+/);
        if (m) return parseInt(m[0].replace(/^#/, ''), 10);
        return null;
    }
    function parseLdrOperand(opStr) {
        if (!opStr) return null;
        var dst = opStr.split(',')[0].trim();
        var m = opStr.match(/\[([x0-9a-zA-Z]+)(?:,\s*(#?-?0x[0-9a-fA-F]+|#?-?\d+))?\]/);
        if (m) {
            var base = m[1];
            var off = parseImm(m[2]) || 0;
            return { dst: dst, base: base, off: off };
        }
        return null;
    } 
    var addr = start;
    var count = 0;
    while (addr.compare(scanEnd) < 0 && count < maxEntries) { 
        var i1 = Instruction.parse(addr);
        if (!i1) { addr = addr.add(4); continue; }
        if (i1.mnemonic !== 'adrp') { addr = addr.add(4); continue; }

        var i2 = Instruction.parse(addr.add(4));
        var i3 = Instruction.parse(addr.add(8));
        var i4 = Instruction.parse(addr.add(12));

        // ADRP + LDR+ ADD + BR
        if (i2 && i2.mnemonic === 'ldr' && i3 && i3.mnemonic === 'add' && i4 && i4.mnemonic === 'br') {
            //fKLog.kCLog({step:'111111111111111', i1, i2, i3, i4 });
            var adrp_dest = regOfFirst(i1.opStr);
            var ldrParsed = parseLdrOperand(i2.opStr); // { dst, base, off }
            var add_dest = regOfFirst(i3.opStr);
            var br_target = i4.opStr.trim().split(/\s+/)[1];


            // 要求最终跳转寄存器等于 add 的目标寄存器（更稳健）
            if (ldrParsed && (add_dest === br_target || adrp_dest === add_dest || ldrParsed.dst === add_dest)) {

                // 解析 immediates
                var adrpImm = ptr(parseImm(i1.opStr));
                var ldrOff = ldrParsed.off || 0;

                var got_slot = adrpImm.add(ldrOff);

                var resolved = null, sym = null;
                try {
                    resolved = Memory.readPointer(got_slot);
                    var ds = DebugSymbol.fromAddress(resolved);
                    sym = ds && ds.name ? ds.name : null;
                } catch (e) { 
                }
                if (sym == null) {
                    fKLog.kCLog({ name: "getModulePltStubs", got_slot, slot: DebugSymbol.fromAddress(got_slot), resolved, resolvedInfo: DebugSymbol.fromAddress(resolved), pattern: "ADRP+LDR+ADD+BR" });
                    addr = addr.add(4);
                    continue;
                }
                results.push({
                    address: addr,
                    offset: addr.sub(mod.base),
                    got_slot: got_slot.sub(mod.base),
                    resolved: resolved ? resolved : "0x0",
                    symbol: sym,
                    pattern: "ADRP+LDR+ADD+BR",
                    disasm: i1.toString() + "\n" + i2.toString() + "\n" + i3.toString() + "\n" + i4.toString()
                });
                count++;
                addr = addr.add(16);
                continue;
            }
        }

        // ADRP + LDR + BR
        if (i2 && i2.mnemonic === 'ldr' && i3 && (i3.mnemonic === 'br' || i3.mnemonic === 'blr')) {
            var adrp_dest2 = regOfFirst(i1.opStr);
            var ldrParsed2 = parseLdrOperand(i2.opStr);
            var br_target2 = i3.opStr.trim().split(/\s+/)[1];
            if (adrp_dest2 && ldrParsed2 && ldrParsed2.base === adrp_dest2 && br_target2 === ldrParsed2.dst) {
                var adrpImm2 = parseImm(i1.opStr) || 0;
                var ldrOff2 = ldrParsed2.off || 0;
                var pcPage2 = ptr(addr).and(ptr('0xfffffffffffff000'));
                var page2 = pcPage2.add(ptr(adrpImm2).mul(0x1000));
                var got_slot2 = page2.add(ldrOff2);

                var resolved2 = null, sym2 = null;
                try {
                    
                    resolved2 = Memory.readPointer(got_slot2);
                    var ds2 = DebugSymbol.fromAddress(resolved2);
                    sym2 = ds2 && ds2.name ? ds2.name : null;
                } catch (e) {
                    resolved2 = null;
                    fKLog.kCLog({ name: "getModulePltStubs", e: e, got_slot2, pattern: "ADRP+LDR+ADD+BR" });
                    addr = addr.add(4);
                    continue;
                }
                if (sym2 == null) {
                    fKLog.kCLog({ name: "getModulePltStubs", got_slot2, resolved2, pattern: "ADRP+LDR+ADD+BR" });
                    addr = addr.add(4);
                    continue;
                }
                results.push({
                    plt: addr,
                    got_slot: got_slot2,
                    resolved: resolved2,
                    symbol: sym2,
                    pattern: "ADRP+LDR+BR",
                    disasm: i1.toString() + "\n" + i2.toString() + "\n" + i3.toString()
                });
                count++;
                addr = addr.add(12);
                continue;
            }
        }

        addr = addr.add(4);
    }

    return results;
}