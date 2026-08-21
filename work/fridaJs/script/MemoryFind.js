(function () {
    jsname = "MemoryFind";
    var findstr = "D759FB";
    var pattern = fkConvert.stringToHex(findstr);

    pattern = fkConvert.bytesToHex(fkConvert.hexToBytes("7491c76e9bbd73f1").reverse());//0x7aa98015a8 ef885175f883010d

    fKLog.kLog({ name: '开始查找 ', str: findstr, hex: pattern });

    
    Process.enumerateRanges('r--').forEach(function (range) {
        try {
            Memory.scanSync(range.base, range.size, pattern).forEach(function (match) { 
               // Memory.writeUtf8String(match.address, "a14617d6d86e7324");
                fKLog.kLog({ result: readHex( match.address.add(-0x0),(0x800)), address: match.address });
                
            });
        } catch (e) {
        }
    });

    fKLog.kLog('查找完成');
    //Java.perform(function () {

    //    let C0866d = Java.use("com.nvshen.chmp4.d");
    //    fKLog.kCLog("deviceId:" + C0866d.B().s());
    //});

    //Java.perform(function () {
    //    var javaType.JavaString = Java.use('java.lang.String');

    //    javaType.JavaString.$init.overload('java.lang.String').implementation = function (content) {
    //        fKLog.kLog('javaType.JavaString.$init.overload(\'java.lang.String\')->' + content);
    //        var result = this.$init(content);
    //        return result;
    //    };
    //    javaType.JavaString.$init.overload('[C').implementation = function (content) {
    //        fKLog.kLog("javaType.JavaString.$init.overload('[C')->" + content);
    //        var result = this.$init(content);
    //        return result;
    //    };
    //    var StringFactory = Java.use('java.lang.StringFactory');
    //    StringFactory.newStringFromString.implementation = function (arg0) {
    //        fKLog.kLog("java.lang.StringFactory.newStringFromString->" + arg0);
    //        var result = this.newStringFromString(arg0);
    //        return result;
    //    };
    //    var exampleString1 = javaType.JavaString.$new('Hello World, this is an example string in Java.');
    //    fKLog.kLog('[+] exampleString1: ' + exampleString1);
    //})
})();