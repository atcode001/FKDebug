(function () {
    function fKLog.kLog(context, msg, data) {
        var message = {};
        message["jsname"] = "dump_dex";
        message["msg"] = msg;
        message["data"] = data;
        message["tid"] = getTid();
        message["stack"] = getStacks();
        send(message);
    }
    function klog2(context, msg, data) {
        var message = {};
        message["jsname"] = "dump_dex";
        message["msg"] = msg;
        message["data"] = data;
        message["tid"] = getTid();
        message["stack"] = getStacks2(context);
        send(message);
    }
    ///获取当前线程ID
    function getTid() {
        var process = Java.use("android.os.Process");
        return process.myTid();
    }
    //获取 app 堆栈
    function getStacks2(context) {
        let line = [];
        if (context == null)
            return [];

        var vvv = Thread.backtrace(context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress);
        for (var i = 0; i < vvv.length; i++)
            line.push(JSON.stringify(vvv[i]));

        return line;
    }
    ///获取java堆栈
    function getStacks() {
        //return "";
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
    var console = {};
    console.log = function (log) {
        fKLog.kLog(null, log)
    }

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
    function JavaMapToObject(map) {
        var keyset = map.keySet();
        var it = keyset.iterator();
        var map_dic = {};
        while (it.hasNext()) {
            var keystr = it.next();
            if (keystr == 49 && map.get(keystr).toString().indexOf("org.telegram.messenger:Telegram") != -1) {
                map.replace(keystr, "com.google.android.apps.docs.editors.docs:文档,com.sinovatech.unicom.ui:中国联通,com.x2era.xcloud.app:Fa米家,com.whatsapp:WhatsApp,com.phone580.cn.FBSMarket:蜂助手,com.jingyao.easybike:哈啰,com.mi.globalbrowser:小米浏览器,com.tencent.mm:微信,com.sdu.didi.psnger:滴滴出行,com.tencent.android.qqdownloader:应用宝,com.xsyx.user:兴盛优选,com.pinger.textfree.call:-,cn.com.bailian.bailianmobile:-,com.aefyr.sai:-,com.lenovo.club.app:-,com.cfpamf.zhjfapp:-,com.happigo.activity:-,com.hunantv.imgo.activity:-,com.ss.android.ugc.aweme:-,com.ss.android.ugc.trill:-,com.google.android.apps.walletnfcrel:-,com.tencent.mobileqq:-,me.talkyou.app.im:-,com.suning.mobile.ebuy:-,com.jd.pingou:-,com.unionpay:-,com.baidu.searchbox.lite:-,com.vivo.wallet:-,cn.keleauth.wx:-,com.chase.sig.android:-,com.tongcheng.android:-,com.qihoo.appstore:-,org.mozilla.firefox:-,com.mg.ec:-,com.gogii.textplus:-,com.surfshark.vpnclient.android:-,com.jingdong.app.mall:-,com.gomejr.icash:-,com.binance.dev:-,com.sina.weibo:-,com.malasports.org:-,com.hupu.shihuo:-,com.app.dream11Pro:-,com.ct.client:-,com.eg.android.AlipayGphone:-,com.greenpoint.android.mc10086.activity:-,com.peopletech.peopleplus:-,com.achievo.vipshop:-,com.android.*109,com.google.*111,com.qualcomm.*8")
            }
            if (keystr == 121 && map.get(keystr).toString().indexOf("/lib/arm64/libflutter.so") != -1) {
                map.replace(keystr, "data/app/~~8Kd693nGlD8AMycN6W-j0A==/com.xsyx.user-8GjDLjcNRqW01FHJf7svZg==/lib/arm64/libBugly-ext.so#data/app/~~8Kd693nGlD8AMycN6W-j0A==/com.xsyx.user-8GjDLjcNRqW01FHJf7svZg==/lib/arm64/libwx_gateway.so#data/app/~~8Kd693nGlD8AMycN6W-j0A==/com.xsyx.user-8GjDLjcNRqW01FHJf7svZg==/lib/arm64/libmarsxlog.so#data/app/~~8Kd693nGlD8AMycN6W-j0A==/com.xsyx.user-8GjDLjcNRqW01FHJf7svZg==/lib/arm64/libc++_shared.so#data/app/~~8Kd693nGlD8AMycN6W-j0A==/com.xsyx.user-8GjDLjcNRqW01FHJf7svZg==/lib/arm64/libapp.so#data/app/~~8Kd693nGlD8AMycN6W-j0A==/com.xsyx.user-8GjDLjcNRqW01FHJf7svZg==/lib/arm64/libflutter.so#")
            }
            //if (keystr == 204 && map.get(keystr).toString().indexOf("BinderProxy") != -1) {
            //}
            var valuestr = map.get(keystr).toString();
            map_dic[keystr] = valuestr;
        }
        return map_dic;
    }
    function fkConvert.stringToHex(str) {
        var val = "";
        for (var i = 0; i < str.length; i++) {
            if (val == "")
                val = str.charCodeAt(i).toString(16);
            else
                val = val + str.charCodeAt(i).toString(16);
        }
        return val
    }
    function fkConvert.hexToBytes(str) {
        var pos = 0;
        var len = str.length;
        if (len % 2 != 0) {
            return null;
        }
        len /= 2;
        var hexA = new Array();
        for (var i = 0; i < len; i++) {
            var s = str.substr(pos, 2);
            var v = parseInt(s, 16);
            hexA.push(v);
            pos += 2;
        }
        return hexA;
    }

    var inputModule = "libtongdun.so"
    Process.enumerateModules().forEach(function (module) {
        if (module.name.toUpperCase().indexOf(inputModule.toUpperCase()) < 0) {
            return;
        }
        module.enumerateExports().forEach(function (edata) {
            try {
                if (edata.type != "function") {
                    if (edata.name == "m_keyInfo") {
                        m_keyInfo = edata.address;
                    }
                    if (edata.name == "m_index") {
                        m_index = edata.address;
                    }
                    if (edata.name == "m_fileds_info") {
                        m_fileds_info = edata.address;
                    }
                    return;
                }
                if (edata.name == "JNI_OnLoad") {
                    return;
                }

                if (edata.name == "compress3") {
                    Interceptor.attach(edata.address, {
                        onEnter: function (args) {
                            this.arg1 = args[0];
                            this.arg2 = args[1];
                            this.arg3 = args[2];
                            this.arg4 = args[3];
                            //var v = [];
                            //for (var i = 0; i < this.arg4 - 0; i++) {
                            //    v.push(i);
                            //}
                            //this.arg3.writeByteArray(v)
                            klog2(this.context, "compress3   " + this.arg2.readInt() + " " + fkConvert.bytesToHex(new Uint8Array(this.arg3.readByteArray(this.arg4 - 0))))
                        }, onLeave: function (retval) {
                            klog2(this.context, "compress3  retval " + retval + " " + this.arg2 + " " + this.arg2.readInt() + " " + fkConvert.bytesToHex(new Uint8Array(this.arg1.readByteArray(this.arg2.readInt()))))
                        }
                    });
                    return;
                }
            }
            catch {

            }
        })
    });

    Java.perform(function () {
        var compressNSaddr = Module.findExportByName(inputModule, "compressNS");//QBzjlrmwrGcxCSYURwIzhmjABYufutO 也是压缩
        var compressNS = new NativeFunction(compressNSaddr, "int", ["pointer", "pointer", "pointer", "int"])
        var bytesArray = fkConvert.hexToBytes("31313131313131313131313131313131313131313131313131313131313131313131313131313131313131313131313131");
        var src = Memory.alloc(bytesArray.length);
        var desc = Memory.alloc(bytesArray.length);
        var desc_size = Memory.alloc(8);
        desc_size.writeInt(bytesArray.length);
        src.writeByteArray(bytesArray);

        var result = compressNS(desc, desc_size, src, bytesArray.length)
        var size = desc_size.readInt() - 0;
        console.log(size.toString() + ":" + result)
        var result = fkConvert.bytesToHex(new Uint8Array(desc.readByteArray(size)));
        console.log("zipresult:" + result)
    })
})();
