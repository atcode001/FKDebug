jsname = "fktrace";

(function () {


    function initMessage() {
        var message = {};
        message["jsname"] = "fktrace";
        return message;
    }


    function stalkerTraceRange() {
        this.start = function (traceName, targetModule) {

            this.traceId = traceName + "-" + Math.random().toString().substring(2);
            this.tid = Process.getCurrentThreadId()
            fKLog.kCLog({
                type: "stalkerTraceRange",
                tid: this.traceId,
                moduleBase: targetModule.base
            })

            var moduleBase = targetModule.base;
            var modulesize = targetModule.size

            this.addressInst = {};
            this.logs = [];
            Stalker.follow(this.tid, {
                transform: (iterator) => {
                    const instruction = iterator.next();
                    const startAddress = instruction.address;
                    const isModuleCode = startAddress.compare(moduleBase) >= 0 && startAddress.compare(moduleBase.add(modulesize)) < 0;

                    this.showLog();

                    do {
                        iterator.keep();
                        if (isModuleCode) {
                            var address = ptr(instruction["address"] - moduleBase).toString(16);
                            var item = {
                                block: (startAddress - moduleBase).toString(16),
                                address: address,
                                inst: JSON.parse(JSON.stringify(instruction)),
                                moduleBase: moduleBase,
                                tid: this.trackId,
                            }
                            //fKLog.kCLog(item);
                            this.logs.push(item);

                            iterator.putCallout((context) => {
                                var callOutAddress = ptr(context.pc - moduleBase).toString(16)
                                this.addressInst[callOutAddress] = JSON.parse(JSON.stringify(context))
                                fKLog.kCLog({ block: ptr(startAddress - moduleBase).toString(16), ctx: context });
                            })

                        }
                    } while (iterator.next() !== null);
                }
            })
        }
        this.showLog = function () {
            for (var i = 0; i < this.logs.length; i++) {
                this.logs[i]["ctx"] = this.addressInst[this.logs[i].address]
                fKLog.kCLog(this.logs[i]);
            }

            this.logs = [];
            this.addressInst = {};
        }
        this.stop = function () {
            this.showLog();
            Stalker.unfollow(this.tid);
            Stalker.garbageCollect()
            fKLog.kCLog({
                type: "stalkerTraceRange",
                tid: this.traceId
            })
        }
    }

    function BLStalkerTraceRange() {

        this.start = function (traceName, targetModule) {
            this.traceId = traceName + "-" + Math.random().toString().substring(2);
            this.tid = Process.getCurrentThreadId()
            fKLog.kCLog({
                type: "BLfktraceStart",
                tid: this.traceId,
                moduleBase: targetModule.base
            })

            var moduleBase = targetModule.base;
            var modulesize = targetModule.size

            var addressInst = {};
            Stalker.follow(this.tid, {
                transform: (iterator) => {
                    const instruction = iterator.next();
                    const startAddress = instruction.address;
                    let isModuleCode = startAddress.compare(moduleBase) >= 0 && startAddress.compare(moduleBase.add(modulesize)) < 0;
                    isModuleCode = true;
                    do {
                        iterator.keep();
                        if (isModuleCode) {

                            if (instruction.mnemonic == "bl") {
                                fKLog.kCLog(instruction);

                                var module = DebugSymbol.fromAddress(ptr(instruction.operands[0].value));
                                if (instruction.operands[0].type == "imm") {
                                    fKLog.kCLog({
                                        type: 'BLfktrace',
                                        address: instruction["address"],
                                        bl: ptr(instruction.operands[0].value),
                                        module: module,
                                        m2: DebugSymbol.fromAddress(ptr(startAddress)),
                                        tid: this.trackId,
                                    });
                                } else {
                                    fKLog.kCLog({
                                        type: 'BLfktrace',
                                        address: startAddress,
                                        inst: instruction,
                                        module: module,
                                        tid: this.trackId,
                                    });
                                }
                            } else if (instruction.mnemonic == "blx") {
                                fKLog.kCLog("blx:" + startAddress.toString());

                                addressInst[startAddress.toString()] = { opStr: instruction.opStr };


                                iterator.putCallout((context) => {
                                    fKLog.kCLog(context);
                                    fKLog.kCLog(context.pc.toString());

                                    if (addressInst[context.pc.toString()] != null) {                                         
                                        var module = DebugSymbol.fromAddress(ptr(context[addressInst[callOutAddress].opStr]));
                                        fKLog.kCLog({
                                            type: 'BLXfktrace',
                                            address: context.pc,
                                            blx: ptr(context[addressInst[callOutAddress].opStr]),
                                            module: module,
                                            tid: this.trackId,
                                        });
                                    }
                                })

                            } else if (instruction.mnemonic == "svc") {
                                var module = DebugSymbol.fromAddress(ptr(startAddress));
                                fKLog.kCLog({
                                    type: 'svcfktrace',
                                    address: startAddress,
                                    inst: instruction,
                                    module: module,
                                    tid: this.trackId,
                                });
                            }
                        }
                    } while (iterator.next() !== null);
                }
            })
        }
        this.stop = function () {
            Stalker.unfollow(this.tid);
            Stalker.garbageCollect()
            fKLog.kCLog({
                type: "BLfktraceStart",
                tid: this.traceId
            })
        }
    }

    function BRStalkerTraceRange() {
        this.start = function (traceName, targetModule) {
            this.traceId = traceName + "-" + Math.random().toString().substring(2);
            this.tid = Process.getCurrentThreadId()
            fKLog.kCLog({
                type: "BRfktraceStart",
                tid: this.traceId,
                moduleBase: targetModule.base
            })

            var moduleBase = targetModule.base;
            var modulesize = targetModule.size

            var preAddress = "";
            var addressInst = {};
            Stalker.follow(this.tid, {
                transform: (iterator) => {
                    const instruction = iterator.next();
                    const startAddress = instruction.address;
                    const isModuleCode = startAddress.compare(moduleBase) >= 0 && startAddress.compare(moduleBase.add(modulesize)) < 0;

                    do {
                        iterator.keep();
                        if (isModuleCode) {
                            var address = ptr(instruction["address"] - moduleBase).toString(16);

                            if (instruction.mnemonic == "br") {
                                addressInst[preAddress] = {
                                    address: address,
                                    opStr: instruction.opStr
                                };
                            }
                            preAddress = address;

                            iterator.putCallout((context) => {
                                var callOutAddress = ptr(context.pc - moduleBase).toString(16)
                                if (addressInst[callOutAddress] != null) {

                                    var br = (context[addressInst[callOutAddress].opStr] - moduleBase).toString(16)

                                    fKLog.kCLog({ address: addressInst[callOutAddress].address, inst: "br " + addressInst[callOutAddress].opStr, br: br, traceId: this.traceId });
                                }
                            })
                        }
                    } while (iterator.next() !== null);
                }
            })
        }
        this.stop = function () {
            Stalker.unfollow(this.tid);
            Stalker.garbageCollect()
            fKLog.kCLog({
                type: "BRfktraceFin",
                tid: this.traceId
            })
        }
    }


    var isTrace = false;

    var moduleBase = 0;
    const libname = "libsgmainso-6.6.230507.so";
    var isSpawn = "%spawn%";
    var symbol = "%symbol%";
    var offset = "%offset%";
    var msg = initMessage();
    msg["data"] = '----- start trace -----' + libname;
    send(msg);


    Java.perform(function () {
       
        var stalker = new BLStalkerTraceRange();
        var libnmmp = Process.findModuleByName("libbdsword.so");
        Interceptor.attach(libnmmp.base.add(0x1488), {
            onEnter: function (args) {
                fKLog.kCLog("onEnter");
                stalker.start("11111", Process.findModuleByName("libbdsword.so"));
            },
            onLeave: function (args) {
                fKLog.kCLog("onLeave:" + args.readCString());
                stalker.stop();
            }
        })

        setTimeout(() => {

            let Sword = Java.use("com.bytedance.security.Sword.Sword");
            var bArr = fkConvert.stringToBytes("01");
            let r2 = Sword["clientPacked"](bArr, bArr.length);
            fKLog.kCLog({ base64: fkConvert.bytesToBase64(r2), hex: fkConvert.bytesToHex(r2) });

        }, 500);
    });
    function tracenvshen() {
        let C0866d = Java.use("com.nvshen.chmp4.d");
        var stalker = new BLStalkerTraceRange();

        //"libnmmp.so", 0x10894
        var libnmmp = Process.findModuleByName("libnmmp.so");


        Interceptor.attach(libnmmp.base.add(0x10895), {
            onEnter: function (args) {

                stalker.start("11111", Process.findModuleByName("libart.so"));
            },
            onLeave: function (args) {
                fKLog.kCLog("onLeave" + args);
                fKLog.kCLog("11111" + args.readCString());
                stalker.stop();
            }
        })

        fKLog.kCLog("deviceId:" + C0866d.B().s());
    }
    /**
     * from jnitrace-egine
     */
    function watcherLib(libname, callback) {
        const dlopenRef = Module.findExportByName(null, "dlopen");
        const dlsymRef = Module.findExportByName(null, "dlsym");
        const dlcloseRef = Module.findExportByName(null, "dlclose");

        if (dlopenRef !== null && dlsymRef !== null && dlcloseRef !== null) {
            const dlopen = new NativeFunction(dlopenRef, "pointer", ["pointer", "int"]);
            Interceptor.replace(dlopen, new NativeCallback((filename, mode) => {
                const path = filename.readCString();
                const retval = dlopen(filename, mode);

                if (path !== null) {
                    if (checkLibrary(path)) {
                        // eslint-disable-next-line @typescript-eslint/no-base-to-string
                        trackedLibs.set(retval.toString(), true);
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-base-to-string
                        libBlacklist.set(retval.toString(), true);
                    }
                }

                return retval;
            }, "pointer", ["pointer", "int"]));
        }
    }

    function GetModuleSymbol() {
        var moduleSymbol = [];
        Process.enumerateModules().forEach(function (module) {
            moduleSymbol.push({ modul: module })
        });
        return moduleSymbol;
    }

    //Java.perform(function () {
    //    //var stc = new StalkerTraceRangeC("libsgmainso-6.6.230507.so", 0x40DB8, ["libsgmainso-6.6.230507.so", "libsgmiddletierso-6.6.230507.so", "libsgsecuritybodyso-6.6.230507.so"], false, (args) => {
    //    //    if (args[2] == 70102) {
    //    //        return true;
    //    //    }
    //    //    return false;
    //    //}, () => {
    //    //    stc.stop();
    //    //})
    //    var stc = new StalkerTraceRangeC("libsgmainso-6.5.115.so", 0x3C884, ["libsgmainso-6.5.115.so", "libsgmiddletierso-6.5.91.so", "libsgsecuritybodyso-6.5.115.so"], false, (args) => {
    //        if (args[2] == 70102) {
    //            return true;
    //        }
    //        return false;
    //    }, () => {
    //        stc.stop();
    //    })
    //    function signTest() {
    //        Java.enumerateClassLoaders({
    //            "onMatch": function (loader) {
    //                if (loader.toString().indexOf("libsgmain.so") > 0) {
    //                    Java.classFactory.loader = loader; // 将当前class factory中的loader指定为我们需要的
    //                }
    //            },
    //            "onComplete": function () {
    //                console.log("success");
    //            }
    //        });

    //        let JNICLibrary = Java.use("com.taobao.wireless.security.adapter.JNICLibrary");
    //        JNICLibrary["doCommandNative"].implementation = function (i, objArr) {
    //            if (i == 10401 || i == 70102) {
    //                var param = [];
    //                for (let z = 0; z != objArr.length; z++) {
    //                    var objUse = objArr[z];
    //                    if (objUse != null) {
    //                        param[z] = objUse.toString();
    //                    } else {
    //                        param[z] = null;
    //                    }
    //                }
    //                let result = this["doCommandNative"](i, objArr);
    //                fKLog.kALog({ name: "doCommandNative", cmd: i, param: param, result: result.toString() });
    //                return result;
    //            } else {
    //                return this["doCommandNative"](i, objArr);
    //            }
    //        };
    //        var a = [];
    //        a[0] = "23781390";
    //        a[1] = "11111111111111111111112";
    //        a[2] = javaType.Javaboolean.$new(false);//useWua
    //        a[3] = javaType.JavaInteger.$new(0);//env
    //        a[4] = "mtop.damai.mec.popup.get";//api
    //        a[5] = "pageId=&pageName=1";//extendParas

    //        a[6] = null;//authCode
    //        a[7] = null;//signKey
    //        a[8] = null;//miniWua
    //        a[9] = null;//requestId

    //        a[10] = javaType.JavaInteger.$new(0);
    //        a[11] = javaType.JavaInteger.$new(0);
    //        fKLog.kALog({ name: "signTestStart" })
    //        var r = JNICLibrary.doCommandNative(70102, a);
    //        fKLog.kALog({ name: "signTestEnd" })

    //        //let JNICLibrary = Java.use("com.taobao.wireless.security.adapter.JNICLibrary");
    //        //var hm = javaType.JavaHashMap.$new();
    //        //hm.put("INPUT", "123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
    //        //var a = [];
    //        //a[0] = hm;
    //        //a[1] = "23781390";
    //        //a[2] = javaType.JavaInteger.$new(3);
    //        //a[3] = "";
    //        //a[4] = javaType.Javaboolean.$new(true);
    //        //fKLog.kALog({ name: "signTestStart" })
    //        //var r = JNICLibrary.doCommandNative(10401, a);
    //        //fKLog.kALog({ name: "signTestEnd" })
    //        return r;
    //    }
    //    setTimeout(signTest, 1000);
    //});

    //var libsgmiddletierso = Process.getModuleByName("libsgmiddletierso-6.5.91.so");
    //var libsgmiddletierso0x8E894 = libsgmiddletierso.base.add(0x8E894);
    //Interceptor.attach(libsgmiddletierso0x8E894, {
    //    onEnter: function (args) {
    //        fKLog.kCLog({ x10: this.context.x10 });//, hex: readHex(this.context.x10, 512)
    //    },
    //    onLeave: function (retval) {
    //    }
    //});


    //var libsgmainso = Process.findModuleByName("libsgmainso-6.6.230507.so");
    //var mbase = libsgmainso.base;
    //var p1 = readMultPoint(mbase, `0x21E000+0x190]]]+8]]]+8]]+0x10]+8]]]+0x48]]]`, false)
    //var p2 = readMultPoint(mbase, `0x21E000+0x190]]]+8]]]+8]]+0x10]+8]]]+0x48]]+8]`, false)
    //var p3 = p1.xor(p2);

    //var p4 = readMultPoint(p3, "0xb8]+0x98]+0x7da0]", true)
    //spawn_hook_so("libsgmainso-6.5.115.so", () => { }, () => {
    //    traceAddr(libname, 0x13F4B4, ["libsgmainso-6.5.115.so"], false, (args) => {
    //        if (args[2] == 1) {
    //            return true;
    //        }
    //        return false;
    //    }, () => {
    //        //  var offset = readMultPoint(`${mbase.toString(16)}+2AE7E0]+0x18]]+0x60]+0x21be0+0x50+0x847e0+0x20+0x8+0x5490]`, true);
    //        //  var rr = readMultPoint(`${mbase.toString(16)}+2AE7E0]+0x18]]+0x60]+0x21be0+0x50+0x847e0+0x20+0x8+0x54a0]`);
    //        //  console.log({base: rr, offset: offset, addr: rr.add(offset), ptr: rr.add(offset).readPointer(), str: rr.add(offset).readPointer().readCString() })
    //    });
    //})



    //if (isSpawn) {
    //    spawn_hook(libname, symbol, offset);
    //} else {
    //    // const modules = Process.enumerateModules();
    //    trace(symbol, offset);
    //}
    //function trace(symbol, offset) {
    //    const targetModule = Process.getModuleByName(libname);
    //    moduleBase = targetModule.base;
    //    let targetAddress = null;
    //    if (symbol.length > 0) {
    //        targetAddress = targetModule.findExportByName(symbol);
    //    } else if (offset.length > 0) {
    //        var offsetData = parseInt(offset, 16);

    //        targetAddress = targetModule.base.add(ptr(offsetData));
    //    }
    //    traceAddr(targetAddress)
    //}

    //function spawn_hook(library_name, symbol, offset) {
    //    Interceptor.attach(Module.findExportByName(null, 'android_dlopen_ext'), {
    //        onEnter: function (args) {
    //            // first arg is the path to the library loaded
    //            var library_path = Memory.readCString(args[0])
    //            if (library_path.includes(library_name)) {
    //                var msg = initMessage();
    //                msg["data"] = "[...] Loading library : " + library_path;
    //                send(msg)
    //                this.library_loaded = 1
    //            }
    //        },
    //        onLeave: function (args) {
    //            // if it's the library we want to hook, hooking it
    //            if (this.library_loaded == 1) {
    //                var msg = initMessage();
    //                msg["data"] = "[+] Loaded";
    //                send(msg)
    //                trace(symbol, offset);
    //                this.library_loaded = 0
    //            }
    //        }
    //    })
    //}

})();
