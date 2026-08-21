var kCLogTid = 0;

var androidutilLogFlag = false;
if (typeof jsname == undefined)
    var jsname = "default";

function FKLog() { 
    this.getCStacks = function (context) {
        let line = [];
        if (context == null)
            return [];
        var vvv = Thread.backtrace(context, Backtracer.ACCURATE);
        vvv = vvv.map(DebugSymbol.fromAddress);
        for (var i = 0; i < vvv.length; i++)
            line.push(JSON.stringify(vvv[i]));

        return line;
    } 
    this.kALog = function (data) {
        this.kALogName(data, jsname)
    }
    this.kALogName = function (data, js_name) {
        var message = {};
        message["data"] = data;  
        message["jsname"] = js_name;
        send(message);
    }
    this.kLog = function (data, context) {
        var tid = Process.getCurrentThreadId();
        if (kCLogTid != 0 && kCLogTid != tid)
            return;
        this.kCLogName(data, context, jsname, null)
    }
    var kCLogTid = 0;
    this.kCLog = function (data, context) {
        var tid = Process.getCurrentThreadId();
        if (kCLogTid != 0 && kCLogTid != tid)
            return;
        this.kCLogShow(data, context)
    }

    this.kCLogName = function (data, context, jsname, bin) {
        var message = {};
        message["data"] = data;
        message["tid"] = Process.getCurrentThreadId();
        if (context != null) {
            message["CStack"] = this.getCStacks(context);
        }
        message["jsname"] = jsname;
        if (androidutilLogFlag) {
            this.AndroidLog(JSON.stringify(message));
        }
        if (bin != null)
            send(message, bin);
        else {
            send(message);
        }
    }
    this.kCLogShow = function (data, context) {
        this.kCLogName(data, context, jsname, null)
    }
    var androidutilLogFlag = false;
    this.EnableAndroidLog = function () {
        androidutilLogFlag = true;
    } 
    if (typeof console == undefined) {
        let console = {};
    }
    var that = this;
    console.log = function (v) {
        that.kLog(v, null);
    }
    var kCShowLog = true;
    var kCShowLogTid = 0;
    this.IsShowLog = function () {
        if (!kCShowLog)
            return false;
        if (kCShowLogTid != 0 && kCShowLogTid != Process.getCurrentThreadId())
            return false;
        return true;
    }
    this.EnableLog = function (tid) {
        if (tid == undefined)
            kCShowLogTid = 0;
        else
            kCShowLogTid = tid;
        kCShowLog = true;
        this.kCLog({ type: "EnableLog", kCShowLogTid: kCShowLogTid })
    }
    this.DisableLog = function () {
        kCShowLog = false;
        this.kCLog({ type: "DisableLog" })
    }
}
if (typeof jsname == undefined)
    var jsname = "default";
var fKLog = new FKLog();
//FKLog End

function FkConvert() {

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
function writeStdString(str, data) {
    const isTiny = (str.readU8() & 1) === 0;
    if (isTiny) {
        return str.add(1).writeUtf8String(data);
    }

    return str.add(2 * Process.pointerSize).readPointer().writeUtf8String(data);
}