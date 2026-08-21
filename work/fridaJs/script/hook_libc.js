

//默认使用,后面再搞点默认hook功能
(function () {
    function hookrsa() {
        var soname = "libc++_shared.so"; //"libjni-encrypt-rsa.so"        
        var libso = Process.getModuleByName(soname);
        var stringappend = libso.findExportByName("_ZNSt6__ndk212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc");
        fKLog.kLog({ name: "stringappend", address: stringappend });

        //HookAddress("stringappend", stringappend, 1, - 1);

        //var hookbase = ptr(libso.base).add(0xAFB6);
        //var strlenbase = libso.findExportByName("strlen");
        //var wcslenBase = libso.findExportByName("wcslen");
        //var wcscatbase = libso.findExportByName("wcscat");
        //var strcatbase = libso.findExportByName("strcat");
        //var strcpybase = libso.findExportByName("strcpy");
        //var strncpybase = libso.findExportByName("strncpy");
        //var wcscpybase = libso.findExportByName("wcscpy");
        //var wcsncpybase = libso.findExportByName("wcsncpy");

        //Interceptor.attach(strlenbase, {
        //    onEnter: function (args) {
        //        var src = args[0].readCString();
        //        if (src.length > 20)
        //            fKLog.kLog("strlen:" + src);
        //    },
        //    onLeave: function (retval) {
        //        // klogData("2222");
        //    }
        //});
        //Interceptor.attach(wcscatbase, {
        //    onEnter: function (args) {
        //        var src = args[0].readCString();
        //        var src2 = args[1].readCString();
        //        if (src.length > 20)
        //            fKLog.kLog("wcscat:" + src + src2);
        //    },
        //    onLeave: function (retval) {
        //        // klogData("2222");
        //    }
        //});
        //Interceptor.attach(strcatbase, {
        //    onEnter: function (args) {
        //        var src = args[0].readCString();
        //        var src2 = args[1].readCString();
        //        if (src.length > 20)
        //            fKLog.kLog("strcat:" + src + src2);
        //    },
        //    onLeave: function (retval) {
        //        // klogData("2222");
        //    }
        //});
        //Interceptor.attach(wcslenBase, {
        //    onEnter: function (args) {
        //        var src = args[0].readCString();
        //        if (src.length > 20)
        //            fKLog.kLog("wcslen:" + src);
        //    },
        //    onLeave: function (retval) {
        //        // klogData("2222");
        //    }
        //});

        //Interceptor.attach(strcpybase, {
        //    onEnter: function (args) {
        //        var src = args[1].readCString();
        //        if (src.length > 20)
        //            fKLog.kLog("strcpy:" + src);
        //    },
        //    onLeave: function (retval) {
        //        // klogData("2222");
        //    }
        //});
        //Interceptor.attach(wcscpybase, {
        //    onEnter: function (args) {
        //        var src = args[1].readCString();
        //        if (src.length > 20)
        //            fKLog.kLog("wcscpy:" + src);
        //    },
        //    onLeave: function (retval) {
        //        // klogData("2222");
        //    }
        //});
        //Interceptor.attach(wcsncpybase, {
        //    onEnter: function (args) {
        //        var src = args[1].readCString();
        //        if (src.length > 20)
        //            fKLog.kLog("wcsncpy:" + src);
        //    },
        //    onLeave: function (retval) {
        //        // klogData("2222");
        //    }
        //});
        //Interceptor.attach(strncpybase, {
        //    onEnter: function (args) {
        //        var src = args[1].readCString();
        //        if (src.length > 20)
        //            fKLog.kLog("strncpy:" + src);
        //    },
        //    onLeave: function (retval) {
        //        // klogData("2222");
        //    }
        //});

        //var system_property_getBase = libso.findExportByName("__system_property_get");
        //var __system_property_get_dic = {};
        //Interceptor.attach(system_property_getBase, {
        //    //system_property_getBase 获取系统属性hook
        //    //arg1
        //    //ro.build.id SP2A.220505.006
        //    //ro.product.model Pixel 3a XL
        //    //ro.build.version.sdk 32
        //    //ro.board.platform  sdm710
        //    //ro.product.board   bonito
        //    //ro.hardware        bonito
        //    //ro.product.device  bonito
        //    //ro.product.brand   google
        //    //ro.build.version.release  12
        //    //ro.build.version.codename REL
        //    //ro.product.first_api_level  28
        //    //ro.boot.vbmeta.digest       cd332b2c158dd487f00659e5a9494f8a0d7c7b024ef765250e08ca1119bd5654
        //    //gsm.version.baseband        g670-00145-220106-B-8048689
        //    //ro.product.cpu.abilist      arm64-v8a,armeabi-v7a,armeabi
        //    onEnter: function (args) {
        //        this.args1 = args[0];
        //        this.args2 = args[1];
        //    },
        //    onLeave: function (retval) {
        //        var key = this.args1.readCString();
        //        var value = this.args2.readCString();
        //        if (__system_property_get_dic[key] == null || __system_property_get_dic[key] != value) {
        //            __system_property_get_dic[key] = value;
        //            fKLog.kLog({ name: "__system_property_get", key: this.args1.readCString(), value: value },this.context);
        //        }
        //    }
        //});

        //var lrand48Base = libso.findExportByName("lrand48");
        //Interceptor.attach(lrand48Base, {
        //    //随机数hook
        //    onEnter: function (args) {
        //    },
        //    onLeave: function (retval) {
        //        fKLog.kLog("lrand48 called!" + retval.toInt32(),this.context);
        //        retval.replace(1);
        //    }
        //});

        //var strncatbase = libso.findExportByName("strncat");
        //Interceptor.attach(strncatbase, {
        //    onEnter: function (args) {
        //        try {
        //            var src1 = args[1].readCString();
        //            fKLog.kLog("strncat: " + src1,this.context);
        //        }
        //        catch {

        //        }
        //    },
        //    onLeave: function (retval) {
        //        // klogData("2222");
        //    }
        //});


        fKLog.kLog("memcpy: start");
        var qmemcpybase = libso.findExportByName("memcpy");
        fKLog.kLog("memcpy:" + qmemcpybase);
        Interceptor.attach(qmemcpybase, {
            onEnter: function (args) {
                if (args[2] < 10 * 10000 && args[2] > 100) {
                    try {
                        var vvv = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress);
                        if (vvv[0].moduleName != "libsgmain.so") 
                            return;

                        //   fKLog.kLog(vvv[0])
                        var src0 = args[0].sub(100).readCString();
                        //var src1 = args[1].readCString(5000);
                        //if (src1.indexOf("X-FB-Friendly-Name") > 0) {
                        //    fKLog.kLog(src1,this.context);
                        //}
                        var src1 = args[1].readCString(50);
                        // if (src1.substr(0,2) =="MI") {
                        //    fKLog.kLog(src1,this.context);
                        //}
                        if (src0.length > 10 || src1.length>10) {
                            if (src0.indexOf("googlePixel 3a XL") != -1 || src1.indexOf("googlePixel 3a XL") != -1) {
                               // fKLog.kLog("memcpy:" + src0 + src1);
                            } else {
                                fKLog.kLog("memcpy:" + src0 + src1, this.context);
                            }
                            //fKLog.kLog("memcpy:" + src);
                        }
                        //if (src1.indexOf("tdfpe") != -1)
                        //if (src1.length > 10) {
                        //    var header = src1.substr(0, 6);
                        //    if (header == "R 1021" || header == "551dab" || header =="<?xml ") {
                        //        fKLog.kLog( "memcpy:" + src1,this.context);
                        //    } else {
                        //        fKLog.kLog("memcpy:" + src1);
                        //    }
                        //}
                        //}
                    }
                    catch {

                    }
                }
            },
            onLeave: function (retval) {
                // klogData("2222");
            }
        });


    }


    function main() {
        klogData(null, "", "init", "hook_libc.js init hook success")
        hookrsa();
    }
    setImmediate(main);

})();


