
function MonitorNative(showsoName) {
    if (showsoName == null)
        this.showsoName = [];
    else {
        this.showsoName = showsoName;
        this.showsoModules = [];
        for (var i = 0; i < showsoName.length; i++) {
            this.showsoModules[i] = null;
        }
    }
    this.sonames = {};
    this.passAddress = {};
    this.symbolInfo = {};
    function GetReturnAddressInfo(that, returnAddress) {
        if (that.passAddress[returnAddress] != null)
            return null;

        if (that.showsoName.length == 0) {
            if (that.symbolInfo[returnAddress] == null) {
                that.symbolInfo[returnAddress] = DebugSymbol.fromAddress(returnAddress);
            }

            var returnAddressInfo = that.symbolInfo[returnAddress];
            return returnAddressInfo;
        }
        var isempty = false;
        for (var i = 0; i < that.showsoModules.length; i++) {
            if (that.showsoModules[i] == null) {
                isempty = true;
                continue;
            }
            if (that.showsoModules[i].base <= returnAddress && that.showsoModules[i].maxbase >= returnAddress) {
                returnAddressInfo = { moduleName: that.showsoModules[i].name, address: returnAddress, offset: returnAddress.sub(that.showsoModules[i].base) }
                return returnAddressInfo;
            }
        }
        if (isempty) {
            if (that.symbolInfo[returnAddress] == null) {
                that.symbolInfo[returnAddress] = DebugSymbol.fromAddress(returnAddress);
            }
            var returnAddressInfo = that.symbolInfo[returnAddress];
            for (var i = 0; i < that.showsoName.length; i++) {
                if (that.showsoName[i] != returnAddressInfo.moduleName) {
                    continue;
                }
                that.showsoModules[i] = Process.findModuleByName(showsoName[i]);
                that.showsoModules[i].maxbase = that.showsoModules[i].base.add(that.showsoModules[i].size);
                fKLog.kCLog(that.showsoModules[i]);
                return returnAddressInfo;
            }
        }
        that.passAddress[returnAddress] = true;
        return null;
    }
    this.monitorLic = function (sigleModel) {
        //sigleModel 同一文件 只打印一次日志
        var __system_property_readbuf = Memory.alloc(1024);
        var that = this;
        var monitorFiles = {
            faccessat: {}, fstatat: {}, stat: {}, fopen: {}, open: {}, statfs: {}, openat: {}, opendir: {}, __system_property_find: {}, __system_property: {}
        };
        Interceptor.attach(libcNative.statPtr, {
            onEnter: function (args) {

                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret == null)
                    this.show = false;
                else {
                    this.show = true;
                    this._name = args[0].readCString();

                }

            },
            onLeave: function (retval) {
                if (!this.show)
                    return;
                if (sigleModel) {

                    if (monitorFiles.stat[this._name] != null) {
                        return;
                    }
                    monitorFiles.stat[this._name] = true;
                }
                fKLog.kCLog({ type: "stat", name: this._name, retval: retval, ret: this.ret })
            }
        });

        Interceptor.attach(libcNative.fopenPtr, {
            onEnter: function (args) {
                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret == null)
                    this.show = false;
                else {
                    this.show = true;
                    this._name = args[0].readCString();
                }
            },
            onLeave: function (retval) {
                if (!this.show)
                    return;
                if (sigleModel) {

                    if (monitorFiles.fopen[this._name] != null) {
                        return;
                    }
                    monitorFiles.fopen[this._name] = true;
                }
                fKLog.kCLog({ type: "fopen", name: this._name, retval: retval, ret: this.ret })
            }
        });
        Interceptor.attach(libcNative.openPtr, {
            onEnter: function (args) {
                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret == null)
                    this.show = false;
                else {
                    this.show = true;
                    this._name = args[0].readCString();
                }
            },
            onLeave: function (retval) {
                if (!this.show)
                    return;
                if (sigleModel) {

                    if (monitorFiles.open[this._name] != null) {
                        return;
                    }
                    monitorFiles.open[this._name] = true;
                }
                fKLog.kCLog({ type: "open", name: this._name, retval: retval, ret: this.ret })
            }
        });

        Interceptor.attach(libcNative.openatPtr, {
            onEnter: function (args) {
                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret == null)
                    this.show = false;
                else {
                    this.show = true;
                    this._name = args[1].readCString();
                }
            },
            onLeave: function (retval) {
                if (!this.show)
                    return;
                if (sigleModel) {

                    if (monitorFiles.openat[this._name] != null) {
                        return;
                    }
                    monitorFiles.openat[this._name] = true;
                }
                fKLog.kCLog({ type: "openat", name: this._name, retval: retval, ret: this.ret })
            }
        });
        Interceptor.attach(libcNative.ptracePtr, {
            onEnter: function (args) {
            },
            onLeave: function (retval) {
                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret != null)
                    fKLog.kCLog({ type: "ptrace", retval: retval, ret: this.ret })
            }
        });
        Interceptor.attach(libcNative.faccessatPtr, {
            onEnter: function (args) {

                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret == null)
                    this.show = false;
                else {
                    this.show = true;
                    this._name = args[1].readCString();
                }

            },
            onLeave: function (retval) {
                if (!this.show)
                    return;
                if (sigleModel) {

                    if (monitorFiles.faccessat[this._name] != null) {
                        return;
                    }
                    monitorFiles.faccessat[this._name] = true;
                }
                fKLog.kCLog({ type: "faccessat", name: this._name, retval: retval, ret: this.ret })
            }
        });
        Interceptor.attach(libcNative.fstatatPtr, {
            onEnter: function (args) {

                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret == null)
                    this.show = false;
                else {
                    this.show = true;
                    this._name = args[1].readCString();
                    if (this._name == "/ueventd.andy.rc") {
                        fKLog.fKLog.kALog("fstatat dddd")
                    }
                }

            },
            onLeave: function (retval) {
                if (!this.show)
                    return;
                if (sigleModel) {

                    if (monitorFiles.fstatat[this._name] != null) {
                        return;
                    }
                    monitorFiles.fstatat[this._name] = true;
                }
                fKLog.kCLog({ type: "fstatat", name: this._name, retval: retval, ret: this.ret })
            }
        });


        Interceptor.attach(libcNative.opendirPtr, {
            onEnter: function (args) {
                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret == null)
                    this.show = false;
                else {
                    this.show = true;
                    this.path = args[0].readCString();
                }
            },
            onLeave: function (retval) {
                if (!this.show)
                    return;
                if (sigleModel) {

                    if (monitorFiles.opendir[this._name] != null) {
                        return;
                    }
                    monitorFiles.opendir[this._name] = true;
                }
                fKLog.kCLog({ type: "opendir", path: this.path, retval: retval, ret: this.ret })
            }
        });
        Interceptor.attach(libcNative.statfsPtr, {
            onEnter: function (args) {
                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret == null)
                    this.show = false;
                else {
                    this.show = true;
                    this._name = args[1].readCString();
                }
            },
            onLeave: function (retval) {
                if (!this.show)
                    return;
                if (sigleModel) {

                    if (monitorFiles.statfs[this._name] != null) {
                        return;
                    }
                    monitorFiles.statfs[this._name] = true;
                }
                fKLog.kCLog({ type: "statfs", name: this._name, retval: retval, ret: this.ret })
            }
        });
        Interceptor.attach(libcNative.strcmpPtr, {
            onEnter: function (args) {
                this.args0 = args[0];
                this.args1 = args[1];
            },
            onLeave: function (retValue) {
                var ret = GetReturnAddressInfo(that, this.returnAddress);
                if (ret != null) {
                    var str1 = this.args1.readCString();
                    fKLog.kCLog({ name: "strcmp", str0: this.args0.readCString(), str1: str1, ret: ret })
                }

            }
        });
        Interceptor.attach(libcNative.strstrPtr, {
            onEnter: function (args) {
                this.args0 = args[0];
                this.args1 = args[1];
            },
            onLeave: function (retValue) {
                var ret = GetReturnAddressInfo(that, this.returnAddress);
                if (ret != null) {
                    var str1 = this.args1.readCString();
                    fKLog.kCLog({ name: "strstr", str: this.args0.readCString(), substr: str1, ret: ret })
                }

            }
        })
        Interceptor.attach(libcNative.strcasestrPtr, {
            onEnter: function (args) {
                this.args0 = args[0];
                this.args1 = args[1];
            },
            onLeave: function (retValue) {
                var ret = GetReturnAddressInfo(that, this.returnAddress);
                if (ret != null) {
                    var str1 = this.args1.readCString();
                    fKLog.kCLog({ name: "strcasestr", str: this.args0.readCString(), substr: str1, ret: ret })
                }
            }
        })

        Interceptor.attach(libcNative.__system_property_getPtr, {
            onEnter: function (args) {

                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret == null)
                    this.show = false;
                else {
                    this.show = true;
                    this.arg0 = args[0]
                    this._name = args[0].readCString();
                    this._value = args[1];
                }

            },
            onLeave: function (retval) {
                if (!this.show)
                    return;
                if (sigleModel) {
                    if (monitorFiles.__system_property[this._name] != null) {
                        return;
                    }
                    monitorFiles.__system_property[this._name] = true;
                }

                console.log({
                    type: "__system_property_get",
                    name: this._name,
                    val: this._value.readCString(),
                    returnAddress: this.ret
                });
            }
        });
        Interceptor.attach(libcNative.__system_property_findPtr, {
            onEnter: function (args) {

                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret == null)
                    this.show = false;
                else {
                    this.show = true;
                    this._name = args[0].readCString();
                }

            },
            onLeave: function (retval) {
                if (!this.show)
                    return;
                if (sigleModel) {

                    if (monitorFiles.__system_property_find[this._name] != null) {
                        return;
                    }
                    monitorFiles.__system_property_find[this._name] = true;
                }

                var value = "";
                if (retval != 0) {
                    libcNative.__system_property_read(retval, ptr(0), __system_property_readbuf);
                    value = __system_property_readbuf.readCString();
                }
                if (this._name == "init.svc.adbd") {
                    fKLog.kCLog({
                        type: "__system_property_find",
                        name: this._name,
                        value: value,
                        retval: retval,
                        returnAddress: this.ret
                    }, this.context);
                } else {
                    fKLog.kCLog({
                        type: "__system_property_find",
                        name: this._name,
                        value: value,
                        retval: retval,
                        returnAddress: this.ret
                    });
                }

            }
        });


        Interceptor.attach(libcNative.unamePtr, {
            onEnter: function (args) {
            },
            onLeave: function (retval) {
                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret != null)
                    fKLog.kCLog({ type: "uname", retval: retval, ret: this.ret })
            }
        });
        Interceptor.attach(libcNative.sleepPtr, {
            onEnter: function (args) {
                this.ret = GetReturnAddressInfo(that, this.returnAddress);
                if (this.ret != null)
                    fKLog.kCLog({ type: "sleep", time: args[0], ret: this.ret })
            },
            onLeave: function (retval) {

            }
        });



        Interceptor.attach(libcNative.snprintfPtr, {
            onEnter: function (args) {
                this.args0 = args[0];
                this.args1 = args[1];
                this.args2 = args[2];
            },
            onLeave: function (retValue) {
                var ret = GetReturnAddressInfo(that, this.returnAddress);
                if (ret != null)
                    fKLog.kCLog({ name: "snprintf", str: this.args0.readCString(), format: this.args2.readCString(), ret: ret })
            }
        })
        Interceptor.attach(libcNative.sprintfPtr, {
            onEnter: function (args) {
                this.args0 = args[0];
                this.args1 = args[1];
            },
            onLeave: function (retValue) {
                var ret = GetReturnAddressInfo(that, this.returnAddress);
                if (ret != null) {
                    fKLog.kCLog({ name: "sprintf", str: this.args0.readCString(), format: this.args1.readCString(), ret: ret })
                }
            }
        })
        Interceptor.attach(libcNative.getuidPtr, {
            onEnter: function (args) {
            },
            onLeave: function (retValue) {
                var ret = GetReturnAddressInfo(that, this.returnAddress);
                if (ret != null) {
                    fKLog.kCLog({ name: "getuid", ret: ret, retValue: retValue })
                }
            }
        })
        Interceptor.attach(libcNative.getpidPtr, {
            onEnter: function (args) {
            },
            onLeave: function (retValue) {
                var ret = GetReturnAddressInfo(that, this.returnAddress);
                if (ret != null) {
                    fKLog.kCLog({ name: "getpid", ret: ret, retValue: retValue })
                }
            }
        })
        Interceptor.attach(libcNative.getppidPtr, {
            onEnter: function (args) {
            },
            onLeave: function (retValue) {
                var ret = GetReturnAddressInfo(that, this.returnAddress);
                if (ret != null) {
                    fKLog.kCLog({ name: "getppid", ret: ret, retValue: retValue })
                }
            }
        })
        //Interceptor.attach(libcNative.strcmpPtr, {
        //    onEnter: function (args) {
        //        this.args0 = args[0];
        //        this.args1 = args[1];
        //    },
        //    onLeave: function (retValue) {
        //        var ret = GetReturnAddressInfo(that, this.returnAddress);
        //        if (ret != null)
        //           fKLog.kCLog({ name: "strcmp", str0: this.args0.readCString(), str1: this.args1.readCString(), ret: ret })
        //    }
        //});
        //Interceptor.attach(libcNative.strncmpPtr, {
        //    onEnter: function (args) {
        //        this.args0 = args[0];
        //        this.args1 = args[1];
        //    },
        //    onLeave: function (retValue) {
        //        var ret = GetReturnAddressInfo(that, this.returnAddress);
        //        if (ret != null)
        //           fKLog.kCLog({ name: "strncmp", str0: this.args0.readCString(), str1: this.args1.readCString(), ret: ret })
        //    }
        //});

        //Interceptor.attach(libcNative.strstrPtr, {
        //    onEnter: function (args) {
        //        this.args0 = args[0];
        //        this.args1 = args[1];
        //    },
        //    onLeave: function (retValue) {
        //        var ret = GetReturnAddressInfo(that, this.returnAddress);
        //        if (ret != null)
        //           fKLog.kCLog({ name: "strstr", str: this.args0.readCString(), substr: this.args1.readCString(), ret: ret })
        //    }
        //})
    }
    this.monitorJni = function (callback) {
        var that = this;
        this.monitorJni_cb = callback;
        Java.perform(function () {
            var jniLogger = new JNILogger();
            var jni = GetJniAddress();
            // fKLog.kCLog(jni);
            jni.forEach(function (item) {
                var func_name = item.name;
                if (func_name.includes("reserved")) {
                    return;
                }

                Interceptor.attach(item.address, {
                    onEnter: function (args) {
                        this.show = false;
                        this.ret = GetReturnAddressInfo(that, this.returnAddress);
                        if (this.ret == null)
                            return
                        else
                            this.show = true;

                        if (!fKLog.IsShowLog())
                            return;

                        jniLogger.Enter(item.name, this.context);
                    },
                    onLeave: function (retval) {
                        if (!this.show)
                            return;
                        var log = jniLogger.Leave(item.name, this.context, retval);
                        if (that.monitorJni_cb != undefined && log != null) {
                            that.monitorJni_cb(log);
                        }
                        if (log != null && log.show) {
                            log.show = undefined;

                            if (log.ret_val != undefined) {
                                this.context.x0 = log.ret_val;
                                retval.replace(log.ret_val)
                                log.ret_val_replace = true;
                            }
                            fKLog.kCLog(log);
                        }
                    }
                })
            })
        });
    }
    this.monitorAndroid = function () {

        var TelephonyManager = Java.use("android.telephony.TelephonyManager");
        //IMEI hook
        TelephonyManager.getDeviceId.overload().implementation = function () {
            var temp = this.getDeviceId();
            console.log("real IMEI: " + temp);
            return temp;
        };
        // muti IMEI
        TelephonyManager.getDeviceId.overload('int').implementation = function (p) {
            var temp = this.getDeviceId(p);
            console.log("real IMEI " + p + ": " + temp);
            return temp;
        };
        //IMSI hook
        TelephonyManager.getSimSerialNumber.overload().implementation = function () {
            var temp = this.getSimSerialNumber();
            console.log("real IMSI: " + temp);
            return temp;
        };
        //取出 IMEI 需要 api26以上
        TelephonyManager.getImei.overload().implementation = function () {
            var temp = this.getImei();
            console.log("real IMEI:" + temp);
            return temp;
        }
        TelephonyManager.getImei.overload('int').implementation = function (a) {
            var temp = this.getImei(a);
            console.log("real IMEI(int):" + temp);
            return temp;
        }
        TelephonyManager.getSimOperatorName.overload().implementation = function () {
            var temp = this.getSimOperatorName();
            console.log("real 运营商:" + temp);
            return temp;
        }
        TelephonyManager.getSimOperatorName.overload('int').implementation = function (a) {
            var temp = this.getSimOperatorName(a);
            console.log("real 运营商:" + temp);
            return temp;
        }
        TelephonyManager.getLine1Number.overload().implementation = function () {
            var temp = this.getLine1Number();
            console.log("real MSISDN:" + temp);
            return temp;
        }
        TelephonyManager.getLine1Number.overload('int').implementation = function (a) {
            var temp = this.getLine1Number(a);
            console.log("real MSISDN:" + temp);
            return temp;
        }

        // hook MAC
        var wifi = Java.use("android.net.wifi.WifiInfo");
        wifi.getMacAddress.implementation = function () {
            var tmp = this.getMacAddress();
            fKLog.fKLog.kALog("android.net.wifi.WifiInfo.getMacAddress: " + tmp);
            return tmp;
        }

        var NetworkInterface = Java.use("java.net.NetworkInterface");
        NetworkInterface.getHardwareAddress.implementation = function () {
            var tmp = this.getHardwareAddress();
            fKLog.fKLog.kALog("java.net.NetworkInterface.getHardwareAddress: " + tmp);
            return tmp;
        }

        //ANDOID_ID hook
        var Secure = Java.use("android.provider.Settings$Secure");
        Secure.getString.implementation = function (p1, p2) {
            var temp = this.getString(p1, p2);
            fKLog.fKLog.kALog({ type: "Settings$Secure", name: "getString", p2: p2, value: temp });
            return temp;
        }


        //android的hidden API，需要通过反射调用
        var SP = Java.use("android.os.SystemProperties");
        SP.get.overload('java.lang.String').implementation = function (p1) {
            var tmp = this.get(p1);
            if (tmp != "") {
                fKLog.fKLog.kALog({ type: "SystemProperties", name: "get", p1: p1, value: tmp });
            }
            return tmp;
        }
        SP.get.overload('java.lang.String', 'java.lang.String').implementation = function (p1, p2) {
            //ro.kernel.qemu 模拟器
            var tmp = this.get(p1, p2)
            if (tmp != "") {
                fKLog.fKLog.kALog({ type: "SystemProperties", name: "get", p1: p1, p2: p2, value: tmp });
            }
            return tmp;
        }
        var Runtime = Java.use("java.lang.Runtime");
        Runtime.exec.overload('java.lang.String').implementation = function (a) {
            var tmp = this.exec(a);
            console.log("[Runtime]执行exec的命令:" + a);
            if (a.indexOf("packages") != -1) {
                console.log("应用使用" + a + "收集应用列表");
            }
            return tmp;
        }

        this.monitorStore();
    }
    this.monitorStore = function () {
        var sp = Java.use("android.app.SharedPreferencesImpl$EditorImpl");
        sp.putBoolean.overload('java.lang.String', 'boolean').implementation = function (arg1, arg2) {
            console.log({ type: "store", name: "SharedPreferences.putBoolean", key: arg1, arg2: arg2 });
            return this.putBoolean(arg1, arg2);
        }

        sp.putString.overload('java.lang.String', 'java.lang.String').implementation = function (arg1, arg2) {
            console.log({ type: "store", name: "SharedPreferences.putString", key: arg1, arg2: arg2 });
            return this.putString(arg1, arg2);
        }

        sp.putInt.overload('java.lang.String', 'int').implementation = function (arg1, arg2) {
            console.log({ type: "store", name: "SharedPreferences.putInt", key: arg1, arg2: arg2 });
            return this.putInt(arg1, arg2);
        }

        sp.putFloat.overload('java.lang.String', 'float').implementation = function (arg1, arg2) {
            console.log({ type: "store", name: "SharedPreferences.putFloat", key: arg1, arg2: arg2 });
            return this.putFloat(arg1, arg2);
        }

        sp.putLong.overload('java.lang.String', 'long').implementation = function (arg1, arg2) {
            console.log({ type: "store", name: "SharedPreferences.putLong", key: arg1, arg2: arg2 });
            return this.putLong(arg1, arg2);
        }

        var sp_get = Java.use("android.app.SharedPreferencesImpl");
        sp_get.getString.overload('java.lang.String', 'java.lang.String').implementation = function (arg1, arg2) {
            var r = this.getString(arg1, arg2);
            console.log({ type: "store", name: "SharedPreferences.getString", key: arg1, arg2: arg2, value: r });
            return r;
        }
        //sp_get.getInt.overload('java.lang.String', 'java.lang.Integer').implementation = function (arg1, arg2) {
        //    var r = this.getInt(arg1, arg2);
        //    console.log({ type: "store", name: "SharedPreferences.getInt", key: arg1, arg2: arg2, value: r });
        //    return r;
        //}
        //sp_get.getFloat.overload('java.lang.String', 'java.lang.Float').implementation = function (arg1, arg2) {
        //    var r = this.getFloat(arg1, arg2);
        //    console.log({ type: "store", name: "SharedPreferences.getFloat", key: arg1, arg2: arg2, value: r });
        //    return r;
        //}

        //sp_get.getLong.overload('java.lang.String', 'java.lang.Long').implementation = function (arg1, arg2) {
        //    var r = this.getLong(arg1, arg2);
        //    console.log({ type: "store", name: "SharedPreferences.getLong", key: arg1, arg2: arg2, value: r });
        //    return r;
        //}
        var Secure = Java.use("android.provider.Settings$System");
        Secure.getString.implementation = function (p1, p2) {
            var temp = this.getString(p1, p2);
            fKLog.fKLog.kALog({ type: "store", name: "Settings$System.getString", p2: p2, value: temp });
            return temp;
        }
    }



    function hooksvc(m, offset, callback) {

        var svclogger = new SVCLogger(callback);
        Interceptor.attach(m.base.add(offset), {
            onEnter: function (args) {
                var logs = svclogger.svcEnter(this.context, offset);
                //if (logs != null && logs.name == "openat") {
                //    fKLog.kCLog({ context: this.context });
                //}
            }
        });
        Interceptor.attach(m.base.add(offset + 4), {
            onEnter: function (args) {
                var logs = svclogger.svcLeave(this.context, offset);
                if (logs.reset_retval != undefined)
                    this.context.x0 = logs.reset_retval;
                fKLog.kCLog(logs);
            }
        });
        fKLog.kCLog({ name: "hooksvc", offset: ptr(offset), m: m });
    }
    this.monitorSvcAddress = function (m, offsets, callback) {
        for (var i = 0; i < offsets.length; i++) {
            try {
                hooksvc(m, offsets[i], callback);
            } catch (e) {
                fKLog.kCLog({ name: "monitorSvcAddress", offset: ptr(offsets[i]), msg: e })
            }
            
        }
    }
}
//MonitorNative End