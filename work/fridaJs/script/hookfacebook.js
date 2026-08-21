

//默认使用,后面再搞点默认hook功能
(function () {

    var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    function fkConvert.bytesToBase64(e) {
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
    function fkConvert.bytesToHex(arr) {
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
    function getStacks(context) {
        try {

            let line = [];
            if (context == null)
                return line;
            var vvv = Thread.backtrace(context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress);
            for (var i = 0; i < vvv.length; i++)
                line.push(JSON.stringify(vvv[i]));

            return line;
        }
        catch {
        }
        return [];
    }
    function getStacks2() {
        return "";
    }
    function fKLog.kLog(context, data) {
        var message = {};
        message["jsname"] = "default";
        message["data"] = data;
        message["stack"] = getStacks(context);
        send(message);
    }
    var call_count = {}

    let Summary = Java.use("com.facebook.graphservice.interfaces.Summary");
    Summary["toString"].implementation = function () {
        fKLog.kLog(`Summary.toString is called`);
        let result = this["toString"]();
        fKLog.kLog(`Summary.toString result=${result}`);
        return result;
    };
})();



