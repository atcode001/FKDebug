function FKLog() {

    this.getJavaTid = function () {
        var process = Java.use("android.os.Process");
        return process.myTid();
    }
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
    this.getAStacks = function () {
        var JavaException = Java.use("java.lang.Exception");
        var ins = JavaException.$new("Exception");
        var straces = ins.getStackTrace();

        if (undefined == straces || null == straces) {
            return;
        }
        var stack = [];
        for (var i = 0; i < straces.length; i++) {
            stack.push(straces[i].toString())
        }
        ins.$dispose();
        return stack;
    }
    this.kALog = function (data) {
        this.kALogName(data, jsname)
    }
    this.kALogName = function (data, js_name) {
        var message = {};
        message["data"] = data;
        message["tid"] = this.getJavaTid();
        message["AStack"] = this.getAStacks();
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
        if (bin != null) {

            send(message, bin);

        }
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
    var androidutilLog = null;
    this.AndroidLog = function (msg) {
        if (androidutilLog == null)
            androidutilLog = Java.use('android.util.Log');

        androidutilLog.i(jsname, msg);
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