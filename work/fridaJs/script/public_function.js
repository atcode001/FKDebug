

function FkConvert() {


    this.BigIntToDouble = function (bigInt) {
        try {
            var ab = new ArrayBuffer(8);
            var dv = new DataView(ab);
            dv.setBigUint64(0, bigInt, true);
            return dv.getFloat64(0, true);
        } catch (e) { return null; }
    }
    this.BigIntToFloat = function (bigInt) {
        try {
            // 使用 8 字节容器写入低 4 字节或全部 8 字节，然后读取 float32
            var ab = new ArrayBuffer(8);
            var dv = new DataView(ab);
            dv.setBigUint64(0, bigInt, true);
            return dv.getFloat32(0, true);
        } catch (e) { return null; }
    }

    //数据转换
    this.bytesToBase64 = function (e) {
        if (e == null || e.length == 0)
            return ""
        var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var r, a, c, h, o, t;
        for (c = e.length, a = 0, r = ''; a < c;) {
            if (h = 255 & e[a++], a == c) {
                r += base64EncodeChars.charAt(h >> 2),
                    r += base64EncodeChars.charAt((3 & h) << 4),
                    r += '==';
                break
            }
            if (o = e[a++], a == c) {
                r += base64EncodeChars.charAt(h >> 2),
                    r += base64EncodeChars.charAt((3 & h) << 4 | (240 & o) >> 4),
                    r += base64EncodeChars.charAt((15 & o) << 2),
                    r += '=';
                break
            }
            t = e[a++],
                r += base64EncodeChars.charAt(h >> 2),
                r += base64EncodeChars.charAt((3 & h) << 4 | (240 & o) >> 4),
                r += base64EncodeChars.charAt((15 & o) << 2 | (192 & t) >> 6),
                r += base64EncodeChars.charAt(63 & t)
        }
        return r
    }
    this.stringToBase64 = function (e) {
        var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var r, a, c, h, o, t;
        for (c = e.length, a = 0, r = ''; a < c;) {
            if (h = 255 & e.charCodeAt(a++), a == c) {
                r += base64EncodeChars.charAt(h >> 2),
                    r += base64EncodeChars.charAt((3 & h) << 4),
                    r += '==';
                break
            }
            if (o = e.charCodeAt(a++), a == c) {
                r += base64EncodeChars.charAt(h >> 2),
                    r += base64EncodeChars.charAt((3 & h) << 4 | (240 & o) >> 4),
                    r += base64EncodeChars.charAt((15 & o) << 2),
                    r += '=';
                break
            }
            t = e.charCodeAt(a++),
                r += base64EncodeChars.charAt(h >> 2),
                r += base64EncodeChars.charAt((3 & h) << 4 | (240 & o) >> 4),
                r += base64EncodeChars.charAt((15 & o) << 2 | (192 & t) >> 6),
                r += base64EncodeChars.charAt(63 & t)
        }
        return r
    }
    this.base64ToString = function (e) {
        var base64DecodeChars = new Array((-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), 62, (-1), (-1), (-1), 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, (-1), (-1), (-1), (-1), (-1), (-1), (-1), 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, (-1), (-1), (-1), (-1), (-1), (-1), 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, (-1), (-1), (-1), (-1), (-1));
        var r, a, c, h, o, t, d;
        for (t = e.length, o = 0, d = ''; o < t;) {
            do
                r = base64DecodeChars[255 & e.charCodeAt(o++)];
            while (o < t && r == -1);
            if (r == -1)
                break;
            do
                a = base64DecodeChars[255 & e.charCodeAt(o++)];
            while (o < t && a == -1);
            if (a == -1)
                break;
            d += String.fromCharCode(r << 2 | (48 & a) >> 4);
            do {
                if (c = 255 & e.charCodeAt(o++), 61 == c)
                    return d;
                c = base64DecodeChars[c]
            } while (o < t && c == -1);
            if (c == -1)
                break;
            d += String.fromCharCode((15 & a) << 4 | (60 & c) >> 2);
            do {
                if (h = 255 & e.charCodeAt(o++), 61 == h)
                    return d;
                h = base64DecodeChars[h]
            } while (o < t && h == -1);
            if (h == -1)
                break;
            d += String.fromCharCode((3 & c) << 6 | h)
        }
        return d
    }

    this.base64ToBytes = function (e) {
        var base64DecodeChars = new Array((-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), 62, (-1), (-1), (-1), 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, (-1), (-1), (-1), (-1), (-1), (-1), (-1), 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, (-1), (-1), (-1), (-1), (-1), (-1), 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, (-1), (-1), (-1), (-1), (-1));
        var r, a, c, h, o, t, d;
        for (t = e.length, o = 0, d = []; o < t;) {
            do
                r = base64DecodeChars[255 & e.charCodeAt(o++)];
            while (o < t && r == -1);
            if (r == -1)
                break;
            do
                a = base64DecodeChars[255 & e.charCodeAt(o++)];
            while (o < t && a == -1);
            if (a == -1)
                break;
            d.push(r << 2 | (48 & a) >> 4);
            do {
                if (c = 255 & e.charCodeAt(o++), 61 == c)
                    return d;
                c = base64DecodeChars[c]
            } while (o < t && c == -1);
            if (c == -1)
                break;
            d.push((15 & a) << 4 | (60 & c) >> 2);
            do {
                if (h = 255 & e.charCodeAt(o++), 61 == h)
                    return d;
                h = base64DecodeChars[h]
            } while (o < t && h == -1);
            if (h == -1)
                break;
            d.push((3 & c) << 6 | h)
        }
        return d
    }

    this.hexToBase64 = function (str) {
        return this.bytesToBase64(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
    }
    this.base64ToHex = function (str) {
        for (var i = 0, bin = this.base64ToBytes(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
            var tmp = bin[i].toString(16);
            if (tmp.length === 1)
                tmp = "0" + tmp;
            hex[hex.length] = tmp;
        }
        return hex.join("");
    }
    this.bytesToHex = function (arr) {
        if (arr == null)
            return;

        var str = '';
        var k, j;
        for (var i = 0; i < arr.length; i++) {
            k = arr[i];
            j = k;
            if (k < 0) {
                j = k + 256;
            }
            if (j < 16) {
                str += "0";
            }
            str += j.toString(16);
        }
        return str;

    }
    this.hexToBytes = function (hex) {
        return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) { return parseInt(h, 16) }))
    }
    this.stringToHex = function (str) {
        var val = "";
        for (var i = 0; i < str.length; i++) {
            if (val == "")
                val = str.charCodeAt(i).toString(16);
            else
                val += str.charCodeAt(i).toString(16);
        }
        return val
    }
    this.stringToBytes = function (str) {
        var ch, st, re = [];
        for (var i = 0; i < str.length; i++) {
            ch = str.charCodeAt(i);
            st = [];
            do {
                st.push(ch & 0xFF);
                ch = ch >> 8;
            }
            while (ch);
            re = re.concat(st.reverse());
        }
        return re;
    }
    this.bytesToString = function (arr) {
        var str = '';
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] != 0)
                str += String.fromCharCode(arr[i]);
        }
        return str;
    }
    /**
     * ArrayBuffer 转 hex字符串
     * @param {ArrayBuffer} buffer
     */
    this.buf2hex = function (buffer) {
        var arr = new Uint8Array(buffer);
        return Array.prototype.map.call(arr, x => {
            if (x < 0x10)
                return '0' + x.toString(16)
            return x.toString(16);
        }).join('');
    }
    /**
     * hex字符串转ArrayBuffer
     * @param {string} hex
     */
    this.hex2buf = function (hex) {
        return this.hexToBytes(hex).buffer
    }
}
var fkConvert = new FkConvert();
//FkConvert End


function JavaType() {
    this.JavaInteger = Java.use("java.lang.Integer");
    this.JavaHashMap = Java.use('java.util.HashMap');
    this.JavaMap = Java.use('java.util.Map');
    this.JavaString = Java.use('java.lang.String');
    this.JavaObject = Java.use('java.lang.Object');
    this.Javaboolean = Java.use('java.lang.Boolean');
    this.JavaObjectArray = Java.use('[Ljava.lang.Object;');
}
var javaType = new JavaType();
//JavaType End

function SoftBreakPoint() {
    this.soft_breakpoint_infos = [];
    this.thumb_erase_maskcode = 0xfffffffffffe

    function getBreakpointDesc() {
        var breakpoint_desc = {
            breakpoint_ins: '',
            writer: null,
            thumb_writer: null,
            thumb_breakpoint_ins: '00be'
        };
        //长度 thumb恒为2 arm,arm64恒为4
        switch (Process.arch) {
            case "arm64":
                breakpoint_desc.breakpoint_ins = '000020d4'
                breakpoint_desc.writer = Arm64Writer
                break
            case "arm":
                breakpoint_desc.breakpoint_ins = '700020e1'
                breakpoint_desc.writer = ArmWriter
                breakpoint_desc.thumb_writer = ThumbWriter
                break
            default:
                return null;
        }
        return breakpoint_desc;
    }
    this.breakpoint_desc = getBreakpointDesc();
    /**
     * @param pc_addr 目标断点
     * @returns {boolean} 返回真是断点，返回假不是断点
     */
    this.checkbreakpoint = function (pc_addr) {
        if (check_pc_thumb(pc_addr)) {
            return readHex(pc_addr.and(this.thumb_erase_maskcode), 2) === this.breakpoint_desc.thumb_breakpoint_ins
        } else {
            return readHex(pc_addr, 4) === this.breakpoint_desc.breakpoint_ins
        }
    }
    this.Add = function (break_addr) {
        const store_size = Instruction.parse(break_addr).size;
        let soft_breakpoint_info = {};
        soft_breakpoint_info.break_addr = break_addr;
        soft_breakpoint_info.break_len = store_size
        soft_breakpoint_info.ins_content = readHex(break_addr.and(this.thumb_erase_maskcode), store_size)
        soft_breakpoint_info.Enable = true;
        var i = 0;
        for (; i < this.soft_breakpoint_infos.length; i++) {
            if (this.soft_breakpoint_infos[i] == null) {
                this.soft_breakpoint_infos[i] = soft_breakpoint_info;
            }
        }
        if (i == this.soft_breakpoint_infos.length)
            this.soft_breakpoint_infos.push(soft_breakpoint_info)

        if (!this.checkbreakpoint(break_addr)) {
            //fKLog.kCLog({ name: " sbp add4", break_addr: break_addr, store_size: store_size, info: DebugSymbol.fromAddress(break_addr) });
            var that = this;
            if (check_pc_thumb(break_addr)) {
                patchAddressCode(break_addr, 0, fkConvert.hexToBytes(that.breakpoint_desc.thumb_breakpoint_ins));
            } else {
                patchAddressCode(break_addr, 0, fkConvert.hexToBytes(that.breakpoint_desc.breakpoint_ins));
            }
            //Memory.patchCode(ptr(break_addr), store_size, function (code) {
            //   fKLog.kCLog("sbp add45");
            //    let ins_writer = null;
            //    if (check_pc_thumb(break_addr)) {
            //       fKLog.kCLog("sbp add5");
            //        ins_writer = new that.breakpoint_desc.thumb_writer(break_addr.and(that.thumb_erase_maskcode))
            //        ins_writer.putBytes(fkConvert.hex2buf(that.breakpoint_desc.thumb_breakpoint_ins))
            //        ins_writer.flush()
            //       fKLog.kCLog("sbp add6");
            //    } else {
            //       fKLog.kCLog("sbp add7");
            //        ins_writer = new that.breakpoint_desc.writer(break_addr);
            //        ins_writer.putBytes(fkConvert.hex2buf(that.breakpoint_desc.breakpoint_ins))
            //        ins_writer.flush()
            //       fKLog.kCLog("sbp add8");
            //    }
            //});
        }
        return soft_breakpoint_info;
    }
    this.Get = function (break_addr) {
        for (var i = 0; i < this.soft_breakpoint_infos.length; i++) {
            if (this.soft_breakpoint_infos[i] == null)
                continue;
            if (this.soft_breakpoint_infos[i].break_addr == break_addr || this.soft_breakpoint_infos[i].break_addr == break_addr + 1) {
                return this.soft_breakpoint_infos[i];
            }
        }
        return null;
    }
    this.Remove = function (soft_breakpoint_info) {

        const size = soft_breakpoint_info.break_len;
        const content = fkConvert.hex2buf(soft_breakpoint_info.ins_content);
        let pc_addr = ptr(soft_breakpoint_info.break_addr);

        let ins_writer = null;
        if (check_pc_thumb(pc_addr)) {
            ins_writer = new this.breakpoint_desc.thumb_writer(pc_addr.and(this.thumb_erase_maskcode))
        } else {
            ins_writer = new this.breakpoint_desc.writer(pc_addr);
        }

        //恢复原始字节码
        Memory.patchCode(pc_addr, size, function (code) {
            ins_writer.putBytes(content)
            ins_writer.flush()
        });
        for (var i = 0; i < this.soft_breakpoint_infos.length; i++) {
            if (this.soft_breakpoint_infos[i] == soft_breakpoint_info) {
                this.soft_breakpoint_infos.splice(i, 1);
                soft_breakpoint_info.Enable = false;
                break;
            }
        }
    }
    this.RemoveAll = function () {
        for (var i = 0; i < this.soft_breakpoint_infos.length; i++) {
            if (this.soft_breakpoint_infos[i] != null)
                this.Remove(this.soft_breakpoint_infos[i]);
        }
        this.soft_breakpoint_infos = [];
    }
}
//SoftBreakPoint End

/**
 * 内存地址追踪
 * @param {any} breakEvent 回调事件
 */
function MemoryBreakPointTrace(breakEvent) {
    this.sbp = new SoftBreakPoint();
    this.memoryBreakInfos = [];
    this.breakEvent = breakEvent;
    var that = this;
    Process.setExceptionHandler(function (details) {
        return that.ExceptionHandler(details);
    })
    this.ExceptionHandler = function (details) {
        var result = false;
        switch (details.type) {
            case "access-violation":
                {
                    var address = details.memory.address;
                    for (var i = 0; i < this.memoryBreakInfos.length; i++) {
                        var memoryBreakInfo = this.memoryBreakInfos[i];
                        if (address > memoryBreakInfo.memStartAddr && address < memoryBreakInfo.memEndAddr) {
                            //命中内存
                            result = this.resume_pagebreak_write_softbreakpoint_and_show(memoryBreakInfo, details)
                            console.log({ name: "MemoryBreakPointTrace ", details: details });
                        } else if (address > memoryBreakInfo.pageStart && address < memoryBreakInfo.pageEnd) {
                            //命中内存页
                            result = this.resume_pagebreak_write_softbreakpoint(memoryBreakInfo, details)
                        }
                    }
                    break;
                }
            case "breakpoint":
                {
                    var address = details.address;
                    var soft_breakpoint_info = this.sbp.Get(address);
                    if (soft_breakpoint_info != null) {
                        result = this.resume_softbreakpoint_set_pagebreak(soft_breakpoint_info, details)
                    } else {
                        console.log("breakpoint:" + result);
                    }
                    break;
                }
        }
        //console.log("leave:" + result);
        return result;
    }
    /**
     * @param addr  追踪地址
     * @param size  地址大小
     * @param mode  模式："r" 读取追踪，"w" 写入追踪，"rw" 读取写入追踪，"x" 软件异常执行追踪,"int3" 软件断点执行追踪
     */
    this.Add = function (addr, size, mode) {
        var memoryBreakInfo = {};
        memoryBreakInfo.pageStart = addr.and(~(Process.pageSize - 1));
        memoryBreakInfo.pageEnd = memoryBreakInfo.pageStart.add(Process.pageSize);
        memoryBreakInfo.memStartAddr = addr;
        memoryBreakInfo.memEndAddr = addr.add(size);
        memoryBreakInfo.memSize = size;
        memoryBreakInfo.breadkType = mode;
        memoryBreakInfo.Enable = true;
        memoryBreakInfo.data = {};
        switch (mode) {
            case "r":
                memoryBreakInfo.memAddrNewProtect = "-wx";
                break;
            case "w":
                memoryBreakInfo.memAddrNewProtect = "r-x";
                break;
            case "rw":
                memoryBreakInfo.memAddrNewProtect = "--x";
                break;
            case "x":
                memoryBreakInfo.memAddrNewProtect = "rw-";
                break;
            case "int3":
                memoryBreakInfo.memAddrNewProtect = "rwx";
                break;
            default:
                fKLog.kCLog("不支持的模式" + mode)
                return;
        }
        if (memoryBreakInfo.breadkType == "int3") {
            memoryBreakInfo.memAddrOldProtect = getPageProtect(addr);
            this.sbp.Add(addr);
        }
        else {
            memoryBreakInfo.memAddrOldProtect = setPageProtect(addr, memoryBreakInfo.memAddrNewProtect)
            this.memoryBreakInfos.push(memoryBreakInfo);
        }
    }
    this.Remove = function (addr) {
        for (var i = 0; i < this.memoryBreakInfos.length; i++) {
            if (this.memoryBreakInfos[i].memStartAddr == addr) {
                this.memoryBreakInfos[i].Enable = false;
                setPageProtect(this.memoryBreakInfos[i].memStartAddr, this.memoryBreakInfos[i].memAddrOldProtect);
                this.memoryBreakInfos.splice(i, 1);
                break;
            }
        }
        var item = this.sbp.Get(addr);
        if (item == null)
            return;
        this.sbp.Remove(item);
    }
    this.Stop = function () {
        this.sbp.RemoveAll();
        for (var i = 0; i < this.memoryBreakInfos.length; i++) {
            setPageProtect(this.memoryBreakInfos[i].memStartAddr, this.memoryBreakInfos[i].memAddrOldProtect);
        }
    }
    /**
     * 软件断点被命中，删除断点重新设置页面保护进行下一次监听
     * @param soft_breakpoint_info 断点信息
     * @returns {boolean} 真表示异常处理 假表示异常没被处理
     */
    this.resume_softbreakpoint_set_pagebreak = function (soft_breakpoint_info, details) {
        this.sbp.Remove(soft_breakpoint_info);
        if (soft_breakpoint_info.memoryBreakInfo == undefined) {
            if (soft_breakpoint_info.prev == undefined) {
                var nextpc_addr = GetNextInsAddr(soft_breakpoint_info.break_addr)
                var node = this.sbp.Add(nextpc_addr)
                node.prev = soft_breakpoint_info;
                soft_breakpoint_info.data = {};
                soft_breakpoint_info.data.operation = "int3";
                soft_breakpoint_info.data.address = details.address;
                soft_breakpoint_info.data.Context = details.context;
                soft_breakpoint_info.data.ins = GetIns(details.address)
            } else if (soft_breakpoint_info.prev.Enable) {
                soft_breakpoint_info.data.nextContext = details.context;
                this.sbp.Add(soft_breakpoint_info.prev.break_addr);
                this.breakEvent(soft_breakpoint_info.data)
                //结束
            }
        } else {
            var memoryBreakInfo = soft_breakpoint_info.memoryBreakInfo;
            if (memoryBreakInfo.data != null) {
                const data_addr = memoryBreakInfo.memStartAddr;
                const data = readHex(data_addr, memoryBreakInfo.memSize);
                memoryBreakInfo.data.newdata = data;
                memoryBreakInfo.data.nextContext = details.context;
                this.breakEvent(memoryBreakInfo.data);
                //结束
            }
            if (memoryBreakInfo.Enable)
                setPageProtect(ptr(memoryBreakInfo.memStartAddr), memoryBreakInfo.memAddrNewProtect)
        }
        return true
    }

    /**
     * 内存页被命中在下一句指令设置软件断点
     * @param break_info 断点信息 
     */
    this.resume_pagebreak_write_softbreakpoint = function (memoryBreakInfo, details) {
        //fKLog.kCLog({ name: "resume_pagebreak_write_softbreakpoint ", memoryBreakInfo: memoryBreakInfo, details: details, addr: ptr(details.address) });
        //恢复原始的内存保护 
        setPageProtect(memoryBreakInfo.memStartAddr, memoryBreakInfo.memAddrOldProtect)
        var nextpc_addr = GetNextInsAddr(details.address)
        var soft_breakpoint_info = this.sbp.Add(nextpc_addr, memoryBreakInfo);
        soft_breakpoint_info.memoryBreakInfo = memoryBreakInfo;
        memoryBreakInfo.data = null;
        return true
    }
    /**
     * 内存断点被命中重新设置页面保护
     * @param break_info 断点信息 
     * @param details 异常信息 
     */
    this.resume_pagebreak_write_softbreakpoint_and_show = function (memoryBreakInfo, details) {
        const ret = this.resume_pagebreak_write_softbreakpoint(memoryBreakInfo, details);

        const ins = GetIns(details.address);
        const symbol = DebugSymbol.fromAddress(details.address);
        const data_addr = memoryBreakInfo.memStartAddr;
        const data = readHex(data_addr, memoryBreakInfo.memSize);
        memoryBreakInfo.data = {};
        memoryBreakInfo.data.address = memoryBreakInfo.memStartAddr;
        memoryBreakInfo.data.memory = details.memory;
        memoryBreakInfo.data.operation = details.memory.operation;
        memoryBreakInfo.data.ins = ins
        memoryBreakInfo.data.olddata = data;
        memoryBreakInfo.data.olddata = {}
        memoryBreakInfo.data.context = details.context;
        memoryBreakInfo.data.symbol = symbol
        return ret
    }
}
//MemoryBreakPointTrace End

function HttpServer() {
    this.startWebSocket = function (url) {

        Java.perform(function () {
            //  try {

            Java.openClassFile('/data/local/tmp/androidAsync44.dex').load();

            let AsyncHttpClient = Java.use("com.koushikdutta.async.http.AsyncHttpClient");
            let WebSocketConnectCallback = Java.use("com.koushikdutta.async.http.AsyncHttpClient$WebSocketConnectCallback");

            AsyncHttpClient["websocket"].overload('java.lang.String', 'java.lang.String', 'com.koushikdutta.async.http.AsyncHttpClient$WebSocketConnectCallback').implementation = function (uri, protocol, callback) {
                console.log(`AsyncHttpClient.websocket is called: uri=${uri}, protocol=${protocol}, callback=${callback}`);
                let result = this["websocket"](uri, protocol, callback);
                console.log(`AsyncHttpClient.websocket result=${result}`);
                return result;
            };

            var WebSocketConnectTestCallback = Java.registerClass({
                name: "WebSocketConnectTestCallback",
                implements: [WebSocketConnectCallback],
                methods: {
                    onCompleted: function (ex, webSocket) {
                        fKLog.kCLog("4444");
                        webSocket.send("4444");
                    }
                }
            });
            var String = Java.use("java.lang.String");
            var url2 = String.$new(url.replace("ws://", "http://").replace("wss://", "https://"));
            var websocket = AsyncHttpClient.getDefaultInstance().websocket.overload('java.lang.String', 'java.lang.String', 'com.koushikdutta.async.http.AsyncHttpClient$WebSocketConnectCallback');
            websocket.call(url2, null, WebSocketConnectTestCallback.$new());

            fKLog.kCLog("3333");

            //let AsyncHttpGet = Java.use("com.koushikdutta.async.http.AsyncHttpGet");
            //var websocket = AsyncHttpClient.getDefaultInstance().websocket.overload('com.koushikdutta.async.http.AsyncHttpRequest', 'java.lang.String', 'com.koushikdutta.async.http.AsyncHttpClient$WebSocketConnectCallback');
            //var httpGet = AsyncHttpGet.$new(url2);
            //websocket.call(httpGet, null, WebSocketConnectTestCallback.$new());

            //} catch (e) {
            //   fKLog.kCLog('注册服务失败!!!, e:' + e);
            //}
        });
    }
    this.start = function (postRequests, port) {
        var HttpServerRequestCallback = null;
        var CompletedCallback = null;
        var DataEmitter = null;
        var DataCallback = null;
        var StringBody = null;
        function getRQ(pr) {
            var rq = Java.registerClass({
                name: pr.name,
                implements: [HttpServerRequestCallback],
                methods: {
                    onRequest: function (request, response) {
                        try {
                            var requestJsonData = request.getBody().get();
                            var result = pr.request(requestJsonData);
                            response.send(result);
                            return;
                        }
                        catch (e) {
                            fKLog.kCLog({ data: pr.name, e: e })
                        }
                        response.send("{\"status\":false}")
                    }
                }
            });
            return rq;
        }
        function getDataRQ(pr) {

            //var rqCompletedCallback = Java.registerClass({
            //    name: pr.name + "CompletedCallback",
            //    implements: [CompletedCallback],
            //    methods: {
            //        onDataAvailable: function (e, data) {
            //            try {
            //                response.send("{\"status\":true}")
            //            }
            //            catch (e) {
            //               fKLog.kCLog({ data: pr.name, e: e })
            //            }
            //            response.send("{\"status\":false}")
            //        }
            //    }
            //});
            //var rqDataCallback = Java.registerClass({
            //    name: pr.name + "DataCallback",
            //    implements: [DataCallback],
            //    methods: {
            //        onDataAvailable: function (e, data) {
            //            try {
            //                response.send("{\"status\":true}")
            //            }
            //            catch (e) {
            //               fKLog.kCLog({ data: pr.name, e: e })
            //            }
            //            response.send("{\"status\":false}")
            //        }
            //    }
            //});
            var rq = Java.registerClass({
                name: pr.name,
                implements: [HttpServerRequestCallback],
                methods: {
                    onRequest: function (request, response) {
                        //var dc = rqDataCallback.$new();
                        fKLog.kCLog("11111111111" + request.getBody().getContentType());
                        //request.getBody().parse();
                        //fKLog.kCLog({ name: "getDataRQ", data: request.getBody().get() })


                        var ByteArrayInputStream = Java.use("java.io.ByteArrayInputStream");
                        var buf = fkConvert.hexToBytes("003b6e5750876d0b7d092aa79cc69347dc861001ba72f71e97905627035d56ac");
                        var sbs = new ByteArrayInputStream.$new(Java.array('byte', buf));
                        response.sendStream(sbs, buf.length)
                    }
                }
            });

            //StringBody = Java.use("com.koushikdutta.async.http.body.StringBody");
            //let HttpUtil = Java.use("com.koushikdutta.async.http.HttpUtil");
            //HttpUtil["getBody"].implementation = function (emitter, reporter, headers) {
            //    console.log(`HttpUtil.getBody is called: emitter=${emitter}, reporter=${reporter}, headers=${headers}`);
            //    let result = this["getBody"](emitter, reporter, headers);
            //    if (result == null) {
            //        return StringBody.$new(javaType.JavaString.$new("unknowbody"));
            //    }
            //    console.log(`HttpUtil.getBody result=${result}`);
            //    return result;
            //}; 
            //StringBody["parse"].implementation = function (emitter, completed) {
            //    console.log(`StringBody.parse is called: emitter=${emitter}, completed=${completed}`);
            //    this["parse"](emitter, completed);
            //    if (this.string == "unknowbody") {

            //    }
            //};
            let ByteBufferList = Java.use("com.koushikdutta.async.ByteBufferList");
            ByteBufferList["readString"].overload('java.nio.charset.Charset').implementation = function (charset) {
                fKLog.kCLog(fkConvert.bytesToHex(this.getAllByteArray()))
                let result = this["readString"](charset);
                console.log(`ByteBufferList.readString result=${result}`);
                return result;
            };
            return rq;
        }
        Java.perform(function () {
            try {
                Java.openClassFile('/data/local/tmp/androidAsync.dex').load();
                HttpServerRequestCallback = Java.use('com.koushikdutta.async.http.server.HttpServerRequestCallback');

                // 实现搜索接口主动调用
                const AsyncHttpServer = Java.use('com.koushikdutta.async.http.server.AsyncHttpServer');
                const androidAsync = AsyncHttpServer.$new();

                // 构建一个默认请求
                var RequestTestCallback = Java.registerClass({
                    name: "RequestTestCallback",
                    implements: [HttpServerRequestCallback],
                    methods: {
                        onRequest: function (request, response) {
                            // 主动调用代码直接写这里
                            response.send("{\"code\":0,\"message\":\" 服务已经注册成功, 默认端口5000\"}");
                        }
                    }
                });
                // 新增路由
                androidAsync.get('/', RequestTestCallback.$new());

                for (var i = 0; i < postRequests.length; i++) {
                    var pr = postRequests[i];

                    var rq = null;

                    if (pr.dataType == "db")
                        rq = getDataRQ(pr);
                    else
                        rq = getRQ(pr);

                    fKLog.kCLog({ data: "/" + pr.name });
                    androidAsync.post("/" + pr.name, rq.$new());
                }

                androidAsync.listen(port);
                fKLog.kCLogName({ name: "Register", port: port }, null, "HttpServer");

            } catch (e) {
                fKLog.kCLog('注册服务失败!!!, e:' + e);
            }
        });
    }
}
var httpServer = new HttpServer();
//HttpServer End


function FkFake() {

    this.fakeTrace = function () {

        var TraceFile = {};
        Interceptor.replace(libcNative.openPtr, new NativeCallback(function (file, flag) {
            var fd = libcNative.open(file, flag);
            var pathname = Memory.readUtf8String(pathnameptr);
            if (pathname.length > 11 && pathname.substr(0, 6) == "/proc/") {
                if (pathname == "/proc/" + getPid() + "/stat" || pathname == "/proc/" + getPid() + "/wchan" || pathname == "/proc/" + getPid() + "/status" || pathname == "/proc/self/status") {
                    TraceFile[fd] = true;
                }
            }
            return fd;
        }, 'int', ['pointer', 'int']));
        Interceptor.replace(libcNative.closePtr, new NativeCallback(function (fd) {
            var retval = libcNative.close(fd);
            TraceFile[fd] = undefined;
            return retval;
        }, 'int', ['int']));
        Interceptor.replace(libcNative.readPtr, new NativeCallback(function (fd, buffer, size) {
            var retval = libcNative.read(fd, buffer, size);
            if (TraceFile[fd]) {
                var logTag = "";
                var bufstr = Memory.readUtf8String(buffer);
                if (bufstr.indexOf("TracerPid:") > -1) {
                    if (bufstr.indexOf("TracerPid:\t0") == -1) {
                        Memory.writeUtf8String(buffer, "TracerPid:\t0");
                        logTag = "TracerPid";
                    }
                } else if (bufstr.indexOf("State:\tt (tracing stop)") > -1) {
                    buffer.writeUtf8String("State:\tS (sleeping)");
                    logTag = 'State';
                }
                else if (bufstr.indexOf("ptrace_stop") > -1) {
                    // ptrace_stop
                    buffer.writeUtf8String("sys_epoll_wait");
                    logTag = 'ptrace_stop';
                }
                else if (bufstr.indexOf(") t") > -1) {
                    buffer.writeUtf8String(bufstr.replace(") t", ") S"));
                    logTag = 'stat_t';
                }
                else if (bufstr.indexOf('SigBlk:') > -1) {
                    // SigBlk
                    buffer.writeUtf8String('SigBlk:\t0000000000001204');
                    logTag = 'SigBlk';
                }
                fKLog.kCLog({ type: "ByPassTracerPid", log: logTag })
            }
            return retval;
        }, 'int', ['int', 'pointer', 'int']));

        Interceptor.replace(libcNative.fopenPtr, new NativeCallback(function (pathnameptr, flag) {
            var fp = libcNative.fopen(pathnameptr, flag);
            var pathname = Memory.readUtf8String(pathnameptr);
            if (pathname.length > 11 && pathname.substr(0, 6) == "/proc/") {
                if (pathname == "/proc/" + getPid() + "/stat" || pathname == "/proc/" + getPid() + "/wchan" || pathname == "/proc/" + getPid() + "/status" || pathname == "/proc/self/status") {
                    TraceFile[fp] = true;
                }
            }
            return fp;
        }, 'pointer', ['pointer', 'pointer']));
        Interceptor.replace(libcNative.fclosePtr, new NativeCallback(function (fp) {
            var retval = libcNative.fclose(fp);
            TraceFile[fp] = undefined;
            return retval;
        }, 'int', ['int']));
        Interceptor.replace(libcNative.fgetsPtr, new NativeCallback(function (buffer, size, fp) {
            var retval = libcNative.fgets(buffer, size, fp);
            if (TraceFile[fp]) {
                var logTag = "";
                var bufstr = Memory.readUtf8String(buffer);
                if (bufstr.indexOf("TracerPid:") > -1) {
                    if (bufstr.indexOf("TracerPid:\t0") == -1) {
                        Memory.writeUtf8String(buffer, "TracerPid:\t0");
                        logTag = "TracerPid";
                    }
                } else if (bufstr.indexOf("State:\tt (tracing stop)") > -1) {
                    buffer.writeUtf8String("State:\tS (sleeping)");
                    logTag = 'State';
                }
                else if (bufstr.indexOf("ptrace_stop") > -1) {
                    // ptrace_stop
                    buffer.writeUtf8String("sys_epoll_wait");
                    logTag = 'ptrace_stop';
                }
                else if (bufstr.indexOf(") t") > -1) {
                    buffer.writeUtf8String(bufstr.replace(") t", ") S"));
                    logTag = 'stat_t';
                }
                else if (bufstr.indexOf('SigBlk:') > -1) {
                    // SigBlk
                    buffer.writeUtf8String('SigBlk:\t0000000000001204');
                    logTag = 'SigBlk';
                }
                fKLog.kCLog({ type: "ByPassTracerPid", log: logTag })
            }
            return retval;
        }, 'pointer', ['pointer', 'int', 'pointer']));
    }
    this.fakemaps = function () {
        var fakemapsPath = "";
        var buffer = Memory.alloc(512);
        Interceptor.replace(libcNative.openPtr, new NativeCallback(function (pathnameptr, flag) {
            var pathname = Memory.readUtf8String(pathnameptr);
            var realFd = libcNative.open(pathnameptr, flag);
            if (pathname.indexOf("maps") == -1) {
                return realFd;
            }
            if (fakemapsPath == "") {
                var selfname = get_self_process_name();
                if (selfname == "<pre-initialized>") {
                    return realFd;
                }
                fakemapsPath = "/data/data/" + selfname + "/xxxmap.db";
            }

            var fakemapsfile = new File(fakemapsPath, "w");
            while (parseInt(libcNative.read(realFd, buffer, 512)) !== 0) {
                var oneLine = Memory.readCString(buffer);
                if (oneLine.indexOf("tmp") === -1) {
                    fakemapsfile.write(oneLine);
                }
            }
            fakemapsfile.close();
            libcNative.close(realFd);
            fKLog.kCLog(fakemapsPath);
            var filename = Memory.allocUtf8String(fakemapsPath);
            return libcNative.open(filename, flag);
        }, 'int', ['pointer', 'int']));
    }
    this.fakestrcmp = function () {

        Interceptor.attach(libcNative.strcmpPtr, {
            onEnter: function (args) {
                this.args0 = args[0];
                this.args1 = args[1];
            },
            onLeave: function (ret) {
                if (ret == 0) {
                    if (this.args1.readCString() == "_ZN3art9ArtMethod12PrettyMethodEb") {
                        ret.replace(1);
                        fKLog.kCLog({ name: "bypass strcmp" })
                    }
                }
            }
        });
    }
    this.fakestrstr = function () {
        fKLog.kCLog({ name: "fakestrstr", strstrPtr: libcNative.strstrPtr, _strchr_chkPtr: libcNative._strchr_chkPtr })
        function check(arg1) {
            if (arg1 == "gmain" || arg1 == "gum-js-loop" || arg1 == "Frida" || arg1 == "linjector" || arg1 == "gdbus" || arg1 == "pool-Frida" || arg1 == "Frida-agent" || arg1 == "_AGENT_1.0"
            ) {
                fKLog.kCLog({ name: fakestrstr, str: arg1 })
                if (this.returnAddress % 0x1000 == 0xA8c) {
                    var arg0 = this.args0.readCString();
                    var moduleBase = this.returnAddress.add(-0x1AA8C);
                    var hex = readHex(moduleBase.add(0x81F0), 4);

                    if (hex == "d00100f0") {
                        fKLog.kCLog({
                            name: "bypass strstr", arg0: arg0, arg1: arg1, returnAddress: DebugSymbol.fromAddress(this.returnAddress), base: moduleBase,
                            str1: moduleBase.add(0x4504A).readCString(), str2: moduleBase.add(0x45056).readCString(), str3: moduleBase.add(0x4506A).readCString()
                            , str4: moduleBase.add(0x45094).readCString(), str5: moduleBase.add(0x4509F).readCString()
                        });

                        //fKLog.kCLog({ base: moduleBase.add(0x81F0), data: readHex(moduleBase.add(0x81F0), 4) })
                        //patchAddressCode(moduleBase, 0x81F0, [0xc0, 0x03, 0x5f, 0xD6])
                        //patchAddressCode(moduleBase, 0x8020, [0xc0, 0x03, 0x5f, 0xD6])//exit
                        //fKLog.kCLog({ base: moduleBase.add(0x81F0), data: readHex(moduleBase.add(0x81F0), 4) })

                        patchAddressCode(moduleBase, 0x1B870, [0x1F, 0x20, 0x03, 0xD5])
                        patchAddressCode(moduleBase, 0x1B874, [0x1F, 0x20, 0x03, 0xD5])
                        patchAddressCode(moduleBase, 0x1B878, [0x1F, 0x20, 0x03, 0xD5])
                        patchAddressCode(moduleBase, 0x1B87c, [0x1F, 0x20, 0x03, 0xD5])


                        //Interceptor.replace(moduleBase.add(0x81F0), new NativeCallback(function (status) { 
                        //   fKLog.kCLog({ name: "onEnter 0x81F0", returnAddress: (this.returnAddress - moduleBase).toString(16) });
                        //}, 'void', ['int']));
                        //fKLog.kCLog({ data: readHex(moduleBase.add(0x81F0), 4) });
                    }
                }

                return false;
            }
            return true;
        }
        Interceptor.attach(libcNative.strstrPtr, {
            onEnter: function (args) {
                this.args0 = args[0];
                this.args1 = args[1];
            },
            onLeave: function (ret) {
                if (ret != 0) {
                    var arg1 = this.args1.readCString();
                    if (!check(arg1)) {
                        ret.replace(0);
                    }
                }
            }
        })
        Interceptor.attach(libcNative._strchr_chkPtr, {
            onEnter: function (args) {
                this.args0 = args[0];
                this.args1 = args[1];
            },
            onLeave: function (ret) {
                if (ret != 0) {
                    var args0 = this.args0.readCString();// String.fromCharCode(this.args1);
                    if (!check(args0)) {
                        ret.replace(0);
                    }
                }
            }
        })
    }
    this.fakeAbort = function () {
        var abort = {
            onEnter: function (args) {
                fKLog.kCLog({ name: "abort", returnAddress: DebugSymbol.fromAddress(this.returnAddress) });
            },
            onLeave: function (ret) {
            }
        };
        Interceptor.attach(libcNative.exitPtr, abort);
        Interceptor.attach(libcNative._ExitPtr, abort);
        Interceptor.attach(libcNative._exitPtr, abort);
        Interceptor.attach(libcNative.quick_exitPtr, abort);
        Interceptor.attach(libcNative.__cxa_atexitPtr, abort);
        Interceptor.attach(libcNative.abortPtr, abort);
    }
    this.bypass = function () {
        //ByPassTracerPid();
        //fakemaps();
        //fakeAbort();
        // 
        fakestrstr();
        //HookSharedPreferences();

        Java.perform(function () {
            var File = Java.use("java.io.File");
            var suFiles = [
                "/system/app/Superuser.apk", "/sbin/su", "/system/bin/su", "/system/xbin/su", "/data/local/xbin/su", "/data/local/bin/su", "/system/sd/xbin/su", "/system/bin/failsafe/su",
                "/data/local/su", "/su/bin/su", "/su/bin", "/system/xbin/daemonsu", "eu.chainfire-supersu-1.apk", "/system/app/eu.chainfire-supersu-1.apk", "/system/bin/.ext/su", "/system/usr/we-need-root/su",
                "/magisk/phhsu", "/cache/susu", "/data/local/bin/susu", "/data/local/susu", "/data/local/xbin/susu", "/data/susu", "/system/bin/failsafe/susu", "/system/bin/susu", "/su", "/magisk"
            ];
            var emulatorFiels = [
                "/system/libc_malloc_debg_qem.so", "/sys/qemu_trace", "/system/bin/qemu-props",
                "/dev/socket/genyd", "/dev/socket/baseband_genyd", "/fstab.andy", "/ueventd.andy.rc", "/fstab.nox", "/init.nox.rc", "/ueventd.nox.rc", "/dev/socket/qemud", "/dev/qemu_pipe", "/ueventd.android_x86.rc", "/x86.prop",
                "/ueventd.ttVM_x86.rc", "/init.ttVM_x86.rc", "/fstab.ttVM_x86", "/fstab.vbox86", "/init.vbox86.rc", "/ueventd.vbox86.rc"]
            File.exists.implementation = function () {
                var r = this.exists();
                if (!r)
                    return r;

                var path = this.getAbsolutePath();
                for (var i = 0; i < suFiles.length; i++) {
                    if (suFiles[i] == path) {

                        fKLog.kCLog("su file:" + r + " " + path);
                        return false;
                    }
                }
                for (var i = 0; i < suFiles.length; i++) {
                    if (emulatorFiels[i] == path) {
                        fKLog.kCLog("emulatorFiels file:" + r + " " + path);
                        return false;
                    }
                }
                fKLog.kCLog("File.exists:" + r + " " + path);
                return r;
            };

            var Debug = Java.use("android.os.Debug");
            Debug.isDebuggerConnected.implementation = function () {
                console.log("Debugger is connected: " + false);
                return false;
            };
            Debug.waitingForDebugger.implementation = function () {
                return false;
            }
        });
    }


    this.anti_debug = function () {
        anti_fgets();
        anti_exit();
        anti_fork();
        anti_kill();
        anti_ptrace();
        anti_abort();
    }
    this.anti_abort = function () {
        const abort_ptr = Module.findExportByName(null, 'abort');
        if (null == abort_ptr) {
            return;
        }
        fKLog.kCLog({ name: 'anti_abort', abort_ptr: abort_ptr });
        Interceptor.replace(abort_ptr, new NativeCallback(function (code) {
            if (null == this) {
                return 0;
            }
            fKLog.kCLog({ name: 'anti_abort', returnAddress: this.returnAddress, s: DebugSymbol.fromAddress(this.returnAddress) }, this.context);
            return 0;
        }, 'int', ['void']));
    }
    this.anti_exit = function () {
        const exit_ptr = Module.findExportByName(null, '_exit');
        if (null == exit_ptr) {
            return;
        }
        fKLog.kCLog({ name: 'anti_exit', exit_ptr: exit_ptr });
        Interceptor.replace(exit_ptr, new NativeCallback(function (code) {
            if (null == this) {
                return 0;
            }
            fKLog.kCLog({ name: 'anti_exit', returnAddress: this.returnAddress }, this.context);
            return 0;
        }, 'int', ['int', 'int']));
    }
    this.anti_kill = function () {
        const kill_ptr = Module.findExportByName(null, 'kill');
        if (null == kill_ptr) {
            return;
        }
        fKLog.kCLog({ name: 'anti_kill', kill_ptr: kill_ptr });
        Interceptor.replace(kill_ptr, new NativeCallback(function (ptid, code) {
            if (null == this) {
                return 0;
            }
            fKLog.kCLog({ name: 'anti_kill', returnAddress: this.returnAddress }, this.context);
            return 0;
        }, 'int', ['int', 'int']));
    }
    this.anti_fgets = function () {
        const tag = 'anti_fgets';
        const fgetsPtr = Module.findExportByName(null, 'fgets');
        if (null == fgetsPtr) {
            return;
        }
        fKLog.kCLog({ name: 'anti_fgets', fgetsPtr: fgetsPtr });
        var fgets = new NativeFunction(fgetsPtr, 'pointer', ['pointer', 'int', 'pointer']);
        Interceptor.replace(fgetsPtr, new NativeCallback(function (buffer, size, fp) {
            var logTag = null;
            // 读取原 buffer
            var retval = fgets(buffer, size, fp);
            var bufstr = buffer.readCString();

            if (null != bufstr) {
                if (bufstr.indexOf("TracerPid:") > -1) {
                    buffer.writeUtf8String("TracerPid:\t0");
                    logTag = 'TracerPid';
                }
                //State:	S (sleeping)
                else if (bufstr.indexOf("State:\tt (tracing stop)") > -1) {
                    buffer.writeUtf8String("State:\tS (sleeping)");
                    logTag = 'State';
                }
                // ptrace_stop
                else if (bufstr.indexOf("ptrace_stop") > -1) {
                    buffer.writeUtf8String("sys_epoll_wait");
                    logTag = 'ptrace_stop';
                }

                //(sankuai.meituan) t
                else if (bufstr.indexOf(") t") > -1) {
                    buffer.writeUtf8String(bufstr.replace(") t", ") S"));
                    logTag = 'stat_t';
                }

                // SigBlk
                else if (bufstr.indexOf('SigBlk:') > -1) {
                    buffer.writeUtf8String('SigBlk:\t0000000000001204');
                    logTag = 'SigBlk';
                }

                // Fkida
                else if (bufstr.indexOf('Frida') > -1) {
                    // 直接回写空有可能引起崩溃
                    buffer.writeUtf8String("dmemory");
                    logTag = 'Frida';
                }

                if (logTag) {
                    fKLog.kCLog({ name: 'anti_fgets', checkItem: logTag, oldData: bufstr, newData: buffer.readCString(), returnAddress: this.returnAddress }, this.context);
                }
            }
            return retval;
        }, 'pointer', ['pointer', 'int', 'pointer']));
    }
    this.anti_ptrace = function () {
        var ptrace = Module.findExportByName(null, "ptrace");
        if (null == ptrace)
            return;
        fKLog.kCLog({ name: 'anti_ptrace', ptrace: ptrace });
        Interceptor.replace(ptrace, new NativeCallback(function (p1, p2, p3, p4) {
            fKLog.kCLog({ name: 'anti_ptrace_entry' }, this.context);
            return 1;
        }, 'long', ['int', "int", 'pointer', 'pointer']));

    }
    this.anti_fork = function () {
        var fork_addr = Module.findExportByName(null, "fork");
        if (null == fork_addr)
            return;

        fKLog.kCLog({ name: 'anti_fork', fork_addr: fork_addr });
        Interceptor.replace(fork_addr, new NativeCallback(function () {
            fKLog.kCLog({ name: 'fork_addr_entry' }, this.context);
            return -1;
        }, 'int', []));

    }

}
//FkFake End


