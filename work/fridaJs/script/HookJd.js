(function () {
    let q = Java.use("jd.wjlogin_sdk.util.q");
    console.log(q);
    if (q == null) {
        console.log('jd.wjlogin_sdk.util.q 查找失败');

    }
    q["a"].implementation = function (str) {
        console.log('a is called' + ', ' + 'str: ' + str);
        let ret = this.a(str);
        console.log('a ret value is ' + ret);
        return ret;
    };
    let q = Java.use("jd.wjlogin_sdk.util.q");
    q["b"].implementation = function (str) {
        console.log('b is called' + ', ' + 'str: ' + str);
        let ret = this.b(str);
        console.log('b ret value is ' + ret);
        return ret;
    };
})();


function getStacks() {
    var Exception = Java.use("java.lang.Exception");
    var ins = Exception.$new("Exception");
    var straces = ins.getStackTrace();

    if (undefined == straces || null == straces) {
        return;
    }
    var stack = [];
    for (var i = 0; i < straces.length; i++) {
        stack.push(straces[i].toString())
    }
    Exception.$dispose();
    return stack;
}
function fKLog.kLog(data) {
    var message = {};
    message["jsname"] = "default";
    message["data"] = data;
    message["stack"] = getStacks();
    send(message);
}
function klogData(data, key, value) {
    var message = {};
    message["jsname"] = "default";
    message["data"] = data;
    message[key] = value;
    send(message);
}
var soname = "DecryptorJni.so"; //"libjni-encrypt-rsa.so"
var libso = Process.getModuleByName(soname);
var symbols = Module.enumerateSymbolsSync(soname);

for (var i = 0; i < symbols.length; i++) {
    var symbol = symbols[i];
    fKLog.kLog(symbol.name + ":" + symbol.address);
}

//var hookbase = ptr(libso.base).add(0xAFB6);
var strlenbase = libso.findExportByName("strlen");
var qmemcpybase = libso.findExportByName("memcpy");

fKLog.kLog("hookbase:" + "qmemcpy:" + qmemcpybase + " strlen:" + strlenbase + "_" + libso.base);
Interceptor.attach(strlenbase, {
    onEnter: function (args) {
        var src = args[0].readCString();
        if (src.length > 100)
            fKLog.kLog("strlen:" + src);
    },
    onLeave: function (retval) {
        // klogData("2222");
    }
});