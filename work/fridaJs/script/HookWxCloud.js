

//默认使用,后面再搞点默认hook功能
(function () {

    function fkConvert.bytesToBase64(e) {
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
        let line = [];
        if (context == null)
            return line;
        var vvv = Thread.backtrace(context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress);
        for (var i = 0; i < vvv.length; i++)
            line.push(JSON.stringify(vvv[i]));

        return line;
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
    //查找so的符号
    function showExport(inputModule) {
        var cnt = 0;
        Process.enumerateModules().forEach(function (module) {
            if (module.name.toUpperCase().indexOf(inputModule.toUpperCase()) < 0) {
                return;
            }
            module.enumerateExports().forEach(function (edata) {
                try {
                    if (edata.type != "function") {
                        //fKLog.kLog(null, "导出字段" + edata.name + " => " + edata.address.readCString());
                        return;
                    }
                    if (edata.name == "JNI_OnLoad" || edata.name == "_ZdlPvRKSt9nothrow_t" || edata.name == "_ZNSt6__ndk112system_errorD2Ev") {
                        return;
                    }
                    var postRequestArgs = null;
                    //if (edata.name == "postRequest") {
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            fKLog.kLog(this.context, "postRequest "
                    //                + " a0=" + args[0].readCString() // null
                    //                + " a1:" + args[1].readCString() //x-wx-host
                    //                + " a2:" + args[2].readCString() //url
                    //                + " a3:" + args[3].readCString() //header
                    //                + " a4:" + args[4].readCString() //参数
                    //                //+ " a5:" + args[5].readCString()
                    //                //+ " a6:" + args[6].readCString()
                    //            );
                    //            postRequestArgs = args[6];
                    //        }, onLeave: function (retval) {
                    //            fKLog.kLog(this.context, "postRequest onLeave " + postRequestArgs.readCString())
                    //        }
                    //    });
                    //    return;
                    //}


                    if (edata.name == "HMAC") {
                        Interceptor.attach(edata.address, {
                            onEnter: function (args) {
                                fKLog.kLog(this.context, "HMAC"
                                    + " a1=" + args[1].readCString()
                                    + " a3=" + args[3].readCString()
                                );
                                this.args5 = args[5];
                                this.args3 = args[3];
                                this.args1 = args[1];
                            }, onLeave: function (retval) {
                                var u8 = new Uint8Array(this.args5.readByteArray(32), { length: 32 });

                                fKLog.kLog(null, { result: "HMAC", key: this.args1.readCString(), src: this.args3.readCString(), hex: fkConvert.bytesToHex(u8), base64: fkConvert.bytesToBase64(u8) });
                            }
                        });
                        return;
                    }
                    if (edata.name.indexOf("Tke0ogHDzCpu5abcdLYnXEPc8IaP1sYuB538w9ZzkkKwBA") != -1) {
                        Interceptor.attach(edata.address, {
                            onEnter: function (args) {
                                fKLog.kLog(this.context, "Encode"
                                    + " a1=" + args[1].readCString()
                                    //+ " a2=" + args[2].readCString()
                                    + " a3=" + args[3].readCString()
                                    //+ " a4=" + args[4].readCString()
                                );
                                this.args4 = args[4];
                                this.args3 = args[3];
                                this.args1 = args[1];
                            }, onLeave: function (retval) {
                                var u8 = new Uint8Array(this.args4.readByteArray(32), { length: 32 });

                                fKLog.kLog(null, { result: "Encode", key: this.args1.readCString(), src: this.args3.readCString(), hex: fkConvert.bytesToHex(u8), base64: fkConvert.bytesToBase64(u8) });
                            }
                        });
                        fKLog.kLog(null, edata.name);
                        return;
                    }
                    if (edata.name == "_ZN7wxcloud7WXCloud4Impl46pabcdya2xZT7wnCSGQNTolgEmaxo755YsV8BkavBcEqE3QERKNSt6__ndk112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE") {
                        Interceptor.attach(edata.address, {
                            onEnter: function (args) {

                                this.args0 = args[0];
                                this.args1 = args[1];
                                this.args2 = args[2];
                                this.args3 = args[3];
                                fKLog.kLog(this.context, "x-wx-call-id"
                                    + " appid=" + args[0].readCString() // null
                                    + " appkey=" + args[0].add(24).readCString() // null
                                    + " a1=" + args[1].readCString() //x-wx-host 
                                    + " a2=" + args[2].readCString() // null
                                    + " a3=" + args[3].readCString() // null
                                );
                            }, onLeave: function (retval) {

                                fKLog.kLog(this.context, "x-wx-call-id onLeave " + this.args[0].readCString() + this.args[1].readCString() + this.args[2].readCString() + this.args[3].readCString())
                            }
                        });
                        return;
                    }
                    if (edata.name.indexOf("AES") == -1 && edata.name.indexOf("tence") == -1)
                        return;
                    cnt += 1;
                    fKLog.kLog(null, cnt + ": module:" + module.name + "----exportName:" + edata.name + "----address:" + edata.address + "----type:" + edata.type)
                    Interceptor.attach(edata.address, {
                        onEnter: function (args) {
                            if (call_count[edata.name] == null)
                                call_count[edata.name] = 0;

                            call_count[edata.name]++;
                            if (call_count[edata.name] < 5)
                                fKLog.kLog(this.context, "call " + edata.name);
                        }, onLeave: function (retval) {
                        }
                    });
                }
                catch {
                }
            });
        });
    }
    showExport("libwx_gateway.so");

})();


