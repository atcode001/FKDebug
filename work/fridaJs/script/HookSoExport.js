

//默认使用,后面再搞点默认hook功能
(function () {
    //查找so的符号
    function showExport(inputModule) {
        var cnt = 0;
        //fKLog.kLog("11111");
        Process.enumerateModules().forEach(function (module) {
            if (module.name.toUpperCase().indexOf(inputModule.toUpperCase()) < 0) {
                return;
            }
            fKLog.kLog(module);
            //HookAddress("3E6EA4", module.base.add(4091556), 8)
            //HookAddress("747224", module.base.add(0x747224), 8)
            //HookAddress("74BD44", module.base.add(0x74BD44), 8)
            //HookAddress("4CE200", module.base.add(0x4CE200), 8)

            //patchAddressCode(module.base, 0x75F1A0, [0x2e, 1, 0, 0x14]);//
            //patchAddressCode(module.base, 0x75F658, [0x33, 0, 0x80, 0x52]);//new Array()

            
            module.enumerateExports().forEach(function (edata) {
                try {
                    //if (edata.type != "function") {
                    //    fKLog.kLog(null, "导出字段" + edata.name + " => " + edata.address.readCString());
                    //    return;
                    //}
                    if (edata.name == "JNI_OnLoad") {
                        return;
                    }
                    //if (edata.name.indexOf("verifyWithMetrics") != -1) {
                    //    fKLog.kLog("Hooking verifyWithMetrics   ")
                    //    var address = edata.address//ptr(0x7bdb66a194);//
                    //    Interceptor.attach(address, {
                    //        onEnter: function (args) {
                    //            fKLog.kLog("verifyWithMetrics   ")
                    //        }, onLeave: function (retval) {
                    //            //retval.replace(0);
                    //            fKLog.kLog("verifyWithMetrics  retval " + retval)
                    //        }
                    //    });
                    //    fKLog.kLog({ name: "verifyWithMetrics", address: edata.address, header: fkConvert.bytesToHex(new Uint8Array(address.readByteArray(20))) });
                    //}
                    //if (edata.name.indexOf("TigonRequest") != -1) {
                    //    //HookBase(edata.name, edata.address, 8);
                    //}
                    //if (edata.name.indexOf("TigonUrl") != -1) {
                    //    HookAddress(edata.name, edata.address, 8);
                    //}
                    //if (edata.name.indexOf("appendEPKc") != -1) {
                    //    HookAddress(edata.name, edata.address, 1);
                    //}
                    //return;
                    cnt += 1;
                    fKLog.kLog(null, { cnt: cnt, module: module.name, exportName: edata.name, address: edata.address, type: edata.type });
                    //HookAddress(edata.name, edata.address, 8, 5);
                }
                catch {
                }
            });
        });
    }
    var library_name = "libsgmainso-6.5.115.so";
    var isSpawn = false;
    var library_loaded = 0;
    if (isSpawn) {
        Interceptor.attach(Module.findExportByName(null, 'android_dlopen_ext'), {
            onEnter: function (args) {
                var library_path = Memory.readCString(args[0])
                if (library_path.includes(library_name)) {
                    library_loaded = 1
                }
            },
            onLeave: function (args) {
                if (library_loaded == 1) {
                    showExport(library_name)
                    library_loaded = 0
                }
            }
        })
    } else {
        showExport(library_name);
    }

})();



