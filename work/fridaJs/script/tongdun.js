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
        fKLog.kLog(log)
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

    var edit_td_map2 = {};
    edit_td_map2[64] = "not charging\0";//充电状态
    edit_td_map2[79] = "g672-10145-720407-B-8148680\0";//gsmId
    edit_td_map2[29] = "69:cd:42:84:97:6d\0";//mac 地址
    edit_td_map2[3] = "0d9113f8-3757-4948-bc965-5422c1d8c4b\0";
    edit_td_map2[128] = edit_td_map2[3] + "#" + edit_td_map2[3] + "#\0";
    edit_td_map2[105] = "fe81::a35f:28b6:4312:239d\0";//ipv6 
    edit_td_map2[69] = "d72c4e8d4b80b3337b0d422bf05b2af48c6e55a130d77f99c8517c74bdd7b9dc\0";//字体sm3 hash 
    edit_td_map2[71] = "8d2b773cce7f52fb\0";//android_id
    edit_td_map2[146] = "3914b97d5f5b2b097aa1b75119e08346f60a99f35c0f528aacfbe17f36c9917f\0";//Media Drm ID 
    edit_td_map2[150] = "876a0cee-b30d-4f67-872a-0bff9a07e46d\0";
    edit_td_map2[117] = '{"fsid":"1f481df5822832f8"}\0';
    edit_td_map2[215] = "2c1f0dd532b064958dd4874f8a0d759e5a9c7250e08ca11b029bd5654ef76514\0";

    edit_td_map2[55] = "\0";//Fkida检测
    edit_td_map2[34] = "\0";//代理检测
    edit_td_map2[37] = "\0";//代理检测
    edit_td_map2[38] = "\0";//代理检测
    edit_td_map2[39] = "dummy0, r_rmnet_data2, r_rmnet_data3, r_rmnet_data0, ip_vti0, lo, r_rmnet_data1, wlan1, wlan0, ip6tnl0, rmnet_data10, bond0, ip6_vti0, sit0, rmnet_data8, rmnet_data7, rmnet_data9, rmnet_data0,  rmnet_data2, rmnet_data1, rmnet_data4,  rmnet_data3, rmnet_data6, rmnet_data5, r_rmnet_data8, r_rmnet_data6, r_rmnet_data7, r_rmnet_data4, r_rmnet_data5, rmnet_ipa0\0";

    edit_td_map2[93] = "995779487I497889743I1991558975I3365950345\0";//流量检测 
    edit_td_map2[92] = "1672220705080_1684710289740|1659499611731_1684711289740|1671869770287_1684713289740|||||||1680159149009_1684715289740||1675521844396_1684716289740||||||||1666770651408_1684718289740||1661230207938_1684719289740||||||||\0";
    edit_td_map2[206] = "|||||||||||||||||||||\0";

    edit_td_map2[49] = "com.sinovatech.unicom.ui: -, com.x2era.xcloud.app: -, com.phone580.cn.FBSMarket: -, com.jingyao.easybike: -, com.mi.globalbrowser: -, com.tencent.mm: -, com.sdu.didi.psnger: -, com.tencent.android.qqdownloader: -, com.xsyx.user: -, com.taobao.taobao: -,  cn.com.bailian.bailianmobile: -, com.lenovo.club.app: -, com.cfpamf.zhjfapp: -, com.happigo.activity: -, com.hunantv.imgo.activity: -,  com.tencent.mobileqq: -, me.talkyou.app.im: -, com.suning.mobile.ebuy: -, com.jd.pingou: -, com.unionpay: -, com.baidu.searchbox.lite: -, com.tongcheng.android: -, com.qihoo.appstore: -, org.mozilla.firefox: -, com.mg.ec: -, com.jingdong.app.mall: -, com.gomejr.icash: -, com.binance.dev: -, com.sina.weibo: -, com.hupu.shihuo: -,com.ct.client: -, com.eg.android.AlipayGphone: -,  com.peopletech.peopleplus: -, com.achievo.vipshop: -, com.android.* 109, com.google.* 111, com.qualcomm.* 8\0";
    //"com.google.android.apps.docs.editors.docs:文档,com.whatsapp:WhatsApp,com.pinger.textfree.call: -, com.aefyr.sai: -, com.gogii.textplus: -, com.malasports.org: -, com.ss.android.ugc.aweme: -, com.ss.android.ugc.trill: -,"
    edit_td_map2[121] = "data/app/~~8Kd693nGlD8AMycN6W-j0A==/com.xsyx.user-8GjDLjcNRqW01FHJf7svZg==/lib/arm64/libBugly-ext.so#data/app/~~8Kd693nGlD8AMycN6W-j0A==/com.xsyx.user-8GjDLjcNRqW01FHJf7svZg==/lib/arm64/libwx_gateway.so#data/app/~~8Kd693nGlD8AMycN6W-j0A==/com.xsyx.user-8GjDLjcNRqW01FHJf7svZg==/lib/arm64/libmarsxlog.so#data/app/~~8Kd693nGlD8AMycN6W-j0A==/com.xsyx.user-8GjDLjcNRqW01FHJf7svZg==/lib/arm64/libc++_shared.so#data/app/~~8Kd693nGlD8AMycN6W-j0A==/com.xsyx.user-8GjDLjcNRqW01FHJf7svZg==/lib/arm64/libapp.so#data/app/~~8Kd693nGlD8AMycN6W-j0A==/com.xsyx.user-8GjDLjcNRqW01FHJf7svZg==/lib/arm64/libflutter.so#\0";

    edit_td_map2[88] = "ffffffffff|7863a42000|75a70a2000|7860548000|7860807000|78772bd000\0";

    function dump_dex() {
        var symbol_name_s = ["_ZN3art11ClassLinker11DefineClassEPNS_6ThreadEPKcjNS_6HandleINS_6mirror11ClassLoaderEEERKNS_7DexFileERKNS_3dex8ClassDefE",
            "_ZN3art11ClassLinker11DefineClassEPNS_6ThreadEPKcmNS_6HandleINS_6mirror11ClassLoaderEEERKNS_7DexFileERKNS_3dex8ClassDefE"];

        var symbol_name = "";
        var addr_DefineClass = null;

        for (var i = 0; i < symbol_name_s.length; i++) {
            symbol_name = symbol_name_s[i];
            addr_DefineClass = Module.findExportByName("libart.so", symbol_name);
            if (addr_DefineClass != null)
                break;
        }
        var Isfind = false;
        if (addr_DefineClass == null) {
            Isfind = true;
            var libart = Process.findModuleByName("libart.so");
            var symbols = libart.enumerateSymbols();
            for (var index = 0; index < symbols.length; index++) {
                var symbol = symbols[index];
                symbol_name = symbol.name;
                if (symbol_name.indexOf("ClassLinker") >= 0 &&
                    symbol_name.indexOf("DefineClass") >= 0 &&
                    symbol_name.indexOf("Thread") >= 0 &&
                    symbol_name.indexOf("DexFile") >= 0) {
                    addr_DefineClass = symbol.address;
                    break;
                }
            }
        }

        fKLog.kLog({ name: "DefineClass", symbol_name: symbol_name, address: addr_DefineClass, Isfind });
        var soname = "libc.so"; //"libjni-encrypt-rsa.so"
        var libso = Process.getModuleByName(soname);
        var qmemcpybase = libso.findExportByName("memcpy");
        var showmemcpyLog = false;
        var showmemcpytid = 0;
        Interceptor.attach(qmemcpybase, {
            onEnter: function (args) {
                try {

                    if (!showmemcpyLog || showmemcpytid != getTid())
                        return;
                    //var v = args[1].readCString(4);
                    //var v = fkConvert.bytesToHex(new Uint8Array(args[1].readByteArray(2)));
                    //if (v == "776a") {
                    //    var src1 = args[1].readCString();
                    //    fKLog.kLog( "memcpy:" + src1);
                    //}
                    //return;

                    //var vvv = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress);
                    //if (vvv[0].moduleName == "libtongdun.so") {
                    //   fKLog.kLog( vvv[0])
                    //var src0 = args[0].sub(100).readCString();
                    var src1 = args[1].readCString();
                    //if (src0.length > 10 || src1.length>10) {
                    //    if (src0.indexOf("googlePixel 3a XL") != -1 || src1.indexOf("googlePixel 3a XL") != -1) {
                    //        fKLog.kLog("memcpy:" + src0 + src1);
                    //    } else {
                    //      //  fKLog.kLog("memcpy:" + src);
                    //    }
                    //    //fKLog.kLog("memcpy:" + src);
                    //}
                    //if (src1.indexOf("tdfpe") != -1)
                    //if (src1.length > 10) {
                    //    var header = src1.substr(0, 6);
                    //    if (header == "R 1021" || header == "551dab" || header =="<?xml ") {
                    //        fKLog.kLog( "memcpy:" + src1);
                    //    } else {
                    //    }
                    //}

                    //}
                    fKLog.kLog("memcpy:" + src1);
                }
                catch {

                }

            },
            onLeave: function (retval) {
            }
        });

        var dex_maps = {};
        var dex_count = 1;

        var showMap = false;
        //Java.openClassFile("/data/local/tmp/r0gson.dex").load();
        var load = false;
        if (addr_DefineClass) {
            Interceptor.attach(addr_DefineClass, {
                onEnter: function (args) { },
                onLeave: function (retval) {
                    try {
                        if (!load) {

                            //var targetClass = decodeURIComponent('cn.tongdun.android.k%e2%82%adKKkkkK.k%e2%82%adKKkkkK.Kk%e2%82%ad%e2%82%ad%e2%82%ad%e2%82%adk%e2%82%adkKkk%e2%82%adk%e2%82%ad');
                            //var C0384KkkkKkkk = Java.use(targetClass);
                            //C0384KkkkKkkk["\x20\x02K\x20\x02\x20\x02kKkK\x00"].overload().implementation = function () {
                            //    fKLog.kLog( 'UUID is called');
                            //    let ret = this["\x20\x02K\x20\x02\x20\x02kKkK\x00"]();
                            //    fKLog.kLog( 'UUID ret value is ' + ret);
                            //    return ret;
                            //};
                            //C0384KkkkKkkk["\x20\x02K\x20\x02\x20\x02kKkK\x00"].overload('android.content.Context', 'java.lang.String').implementation = function (context, str) {
                            //    fKLog.kLog( 'UUID is called' + ', ' + 'context: ' + context + ', ' + 'str: ' + str);
                            //    let ret = this["\x20\x02K\x20\x02\x20\x02kKkK\x00"](context, str);
                            //    fKLog.kLog( 'UUID ret value is ' + ret);
                            //    return ret;
                            //};

                            //let C0397kKkkKKKKk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.k\u20ADKKkkkK.kKk\u20ADkKK\u20AD\u20AD\u20ADKKk\u20AD");
                            //C0397kKkkKKKKk["KkkK\u20AD\u20ADKkk\u20ADK\u20ADk\u20ADK\u20AD\u20ADK"].overload().implementation = function () {
                            //    fKLog.kLog( 'time is called');
                            //    let ret = this["KkkK\u20AD\u20ADKkk\u20ADK\u20ADk\u20ADK\u20AD\u20ADK"]();
                            //    fKLog.kLog( 'time ret value is ' + ret);
                            //    return ret;
                            //};

                            //C0397kKkkKKKKk["Kkk\u20ADkK\u20ADK\u20ADK"].overload().implementation = function () {
                            //    fKLog.kLog( 'imei is called');
                            //    let ret = this["Kkk\u20ADkK\u20ADK\u20ADK"]();
                            //    fKLog.kLog( 'imei ret value is ' + ret);
                            //    return ret;
                            //};

                            //C0397kKkkKKKKk["kk\u20AD\u20ADkKkk"].overload().implementation = function () {
                            //    fKLog.kLog( 'su is called');
                            //    let ret = this["kk\u20AD\u20ADkKkk"]();
                            //    fKLog.kLog( 'su ret value is ' + ret);
                            //    return ret;
                            //};
                            //C0397kKkkKKKKk["\u20ADk\u20ADkKKk\u20ADkkK\u20AD\u20ADk\u20AD"].overload('android.content.Context').implementation = function (context) {
                            //    fKLog.kLog( 'proxy is called' + ', ' + 'context: ' + context);
                            //    let ret = this["\u20ADk\u20ADkKKk\u20ADkkK\u20AD\u20ADk\u20AD"](context);
                            //    fKLog.kLog( 'proxy ret value is ' + ret);
                            //    return ret;
                            //};
                            //C0397kKkkKKKKk["KKk\u20ADKkkKKKkKkKkK\u20AD"].overload().implementation = function () {
                            //    fKLog.kLog( '模拟器检测 is called');
                            //    let ret = this["KKk\u20ADKkkKKKkKkKkK\u20AD"]();
                            //    fKLog.kLog( '模拟器检测 ret value is ' + ret);
                            //    return ret;
                            //};
                            //C0397kKkkKKKKk["KkkK\u20AD\u20ADKkk\u20ADK\u20ADk\u20ADK\u20AD\u20ADK"].overload('android.content.Context').implementation = function (context) {
                            //    fKLog.kLog( '模拟器检测2 is called' + ', ' + 'context: ' + context);
                            //    let ret = this["KkkK\u20AD\u20ADKkk\u20ADK\u20ADk\u20ADK\u20AD\u20ADK"](context);
                            //    fKLog.kLog( '模拟器检测2 ret value is ' + ret);
                            //    return ret;
                            //};

                            //C0397kKkkKKKKk["KK\u20AD\u20AD\u20ADk\u20ADKKKkkK\u20AD"].overload('android.content.Context').implementation = function (context) {
                            //    fKLog.kLog( 'google is called' + ', ' + 'context: ' + context);
                            //    let ret = this["KK\u20AD\u20AD\u20ADk\u20ADKKKkkK\u20AD"](context);
                            //    fKLog.kLog( 'google ret value is ' + ret);
                            //    return ret;
                            //};
                            //C0397kKkkKKKKk["KKK\u20ADKkkk"].overload('android.content.Context').implementation = function (context) {
                            //    console.log('电量 is called' + ', ' + 'context: ' + context);
                            //    let ret = this["KKK\u20ADKkkk"](context);
                            //    console.log('电量 ret value is ' + ret);
                            //    return ret;
                            //};
                            //C0397kKkkKKKKk["\u20ADk\u20ADkKKk\u20ADkkK\u20AD\u20ADk\u20AD"].overload('android.content.Context', 'android.telephony.TelephonyManager').implementation = function (context, telephonyManager) {
                            //    console.log('imei2 is called' + ', ' + 'context: ' + context + ', ' + 'telephonyManager: ' + telephonyManager);
                            //    let ret = this["\u20ADk\u20ADkKKk\u20ADkkK\u20AD\u20ADk\u20AD"](context, telephonyManager);
                            //    console.log('imei2 ret value is ' + ret);
                            //    return ret;
                            //};
                            //C0397kKkkKKKKk["KKkkkk\u20AD\u20ADK\u20ADk"].overload('android.content.Context', 'android.app.ActivityManager').implementation = function (context, activityManager) {
                            //    console.log('mem is called' + ', ' + 'context: ' + context + ', ' + 'activityManager: ' + activityManager);
                            //    let ret = this["KKkkkk\u20AD\u20ADK\u20ADk"](context, activityManager);
                            //    console.log('mem ret value is ' + ret);
                            //    return ret;
                            //};

                            //let KkKKKk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.\u20ADK\u20AD\u20ADkKkK.Kk\u20ADKKKk");
                            //KkKKKk["\u20ADk\u20AD\u20AD\u20ADk\u20AD\u20AD\u20ADKk"].implementation = function (kKkkkkKk) {
                            //    fKLog.kLog( '\u20ADk\u20AD\u20AD\u20ADk\u20AD\u20AD\u20ADKk is called' + ', ' + 'kKkkkkKk: ' + kKkkkkKk);
                            //    showMap = true;
                            //    let ret = this["\u20ADk\u20AD\u20AD\u20ADk\u20AD\u20AD\u20ADKk"](kKkkkkKk);
                            //    showMap = false;
                            //    fKLog.kLog( 'map ret value is ' + ret + JSONObject.$new("{}").toString());
                            //    return ret;
                            //};
                            //Java.use("java.util.HashMap").put.implementation = function (a1, a2) {
                            //    var result = this.put(a1, a2);
                            //    //  if (showMap) {
                            //    //if (a2.toString() == "9d2cce7f2b6740fb") {
                            //    //    fKLog.kLog( { name: "map_input", key: a1.toString(), a2: a2.toString() });
                            //    //} else {
                            //    //    fKLog.kLog( { name: "map_input", key: a1.toString(), a2: a2.toString() });
                            //    //}
                            //    //fKLog.kLog( a2.toString());
                            //    //fKLog.kLog( { name: "map_input", key: a1.toString(), a2: a2.toString(), json: JSON.parse(JSONObject.$new(this).toString()) });
                            //    //  }
                            //    if (a1 == 207) {
                            //        fKLog.kLog( { name: "map_input", key: a1.toString(), a2: a2.toString(), json: JSON.stringify(JavaMapToObject(this)) });
                            //    }
                            //    return result;
                            //}

                            let JSONObject = Java.use('org.json.JSONObject');
                            JSONObject.put.implementation = function (a1, a2) {
                                var result = this.put(a1, a2);
                                // if (a1.toString() == "150" || a1.toString() == "215" || a1.toString() == "217" || a1.toString() == "117") {
                                fKLog.kLog({ name: "JSONObject put", key: a1, value: a2 })
                                // }
                                return result;
                            }

                            //Java.use("java.util.UUID").toString.implementation = function () {
                            //    var result = this.toString();
                            //    fKLog.kLog( { name: "UUID", result: result });
                            //    return result;
                            //}

                            let Integer = Java.use("java.lang.Integer");
                            //ret = Integer.$new(1);
                            var HashMap = Java.use('java.util.HashMap');
                            var String = Java.use('java.lang.String');
                            var javaType.JavaObject = Java.use('java.lang.Object');
                            var javaType.Javaboolean = Java.use('java.lang.Boolean');

                            //let C0897KkKkK = Java.use("cn.tongdun.android.k\u20ADKKkkkK.KKKkkK\u20AD\u20ADK\u20ADK.\u20ADK\u20AD\u20ADkKkK");
                            //C0897KkKkK["KKkkkk\u20AD\u20ADK\u20ADk"].overload('cn.tongdun.android.k₭KKkkkK.₭K₭₭kKkK.Kk₭KKKk', 'java.lang.String', 'java.util.List').implementation = function (a1, a2, a3) {

                            //    let ret = this["KKkkkk\u20AD\u20ADK\u20ADk"](a1, a2, a3);
                            //    //var retMap = Java.cast(ret, HashMap);
                            //    //if (retMap.containsKey(49)) {
                            //    //    retMap.replace(49, "org.telegram.messenger:Telegram,com.google.android.apps.docs.editors.docs:文档,com.phonepe.app:PhonePe,com.myairtelapp:Airtel,com.sinovatech.unicom.ui:中国联通,com.x2era.xcloud.app:Fa米家,com.whatsapp:WhatsApp,com.phone580.cn.FBSMarket:蜂助手,com.jingyao.easybike:哈啰,com.mi.globalbrowser:小米浏览器,com.tencent.mm:微信,com.sdu.didi.psnger:滴滴出行,com.tencent.android.qqdownloader:应用宝,com.xsyx.user:兴盛优选,com.pinger.textfree.call:-,cn.com.bailian.bailianmobile:-,com.aefyr.sai:-,com.lenovo.club.app:-,com.cfpamf.zhjfapp:-,com.happigo.activity:-,com.hunantv.imgo.activity:-,com.ss.android.ugc.aweme:-,com.ss.android.ugc.trill:-,com.google.android.apps.walletnfcrel:-,com.tencent.mobileqq:-,me.talkyou.app.im:-,com.suning.mobile.ebuy:-,com.jd.pingou:-,com.unionpay:-,com.baidu.searchbox.lite:-,com.vivo.wallet:-,cn.keleauth.wx:-,com.chase.sig.android:-,com.tongcheng.android:-,com.qihoo.appstore:-,org.mozilla.firefox:-,com.mg.ec:-,com.gogii.textplus:-,com.surfshark.vpnclient.android:-,com.jingdong.app.mall:-,com.gomejr.icash:-,com.binance.dev:-,com.sina.weibo:-,com.malasports.org:-,com.hupu.shihuo:-,com.app.dream11Pro:-,com.ct.client:-,com.eg.android.AlipayGphone:-,tech.evlsoc.captivemgr:-,com.greenpoint.android.mc10086.activity:-,com.peopletech.peopleplus:-,com.achievo.vipshop:-,com.wantime.wbangapp.pika:-,com.android.*109,com.google.*111,com.qualcomm.*8");
                            //    //}
                            //    fKLog.kLog( 'map is called  obj: ' + JSON.stringify(JavaMapToObject(ret)));

                            //    var hm = HashMap.$new();
                            //    //hm[1] = 111;
                            //    //fKLog.kLog( 'exprot is called  hm: ' + JSON.stringify(JavaMapToObject(hm)));

                            //    //hm.put(1, 111);
                            //    //hm.put(2, 222);
                            //    //hm.put(3, 333);
                            //    //fKLog.kLog( "222222222222222222");
                            //    return hm;
                            //};



                            var qmemcpybase = 0;
                            let HelperJNI = Java.use("cn.tongdun.android.shell.common.HelperJNI");
                            HelperJNI["exprot"].implementation = function (i2, obj) {
                                if (i2 == 20 || i2 == 2 || i2 == 14 || i2 == 15) {
                                    var ArrayClz = Java.use("java.lang.reflect.Array");
                                    var len = ArrayClz.getLength(obj);
                                    var obj2 = ArrayClz.get(obj, 0)
                                    var arr = Java.array("byte", obj2);
                                    fKLog.kLog({ name: "exprot", i2: i2, size: arr.length, obj: String.$new(arr, "utf-8").toString(), objBytes: fkConvert.bytesToBase64(arr) });

                                } else if (i2 == 3 || i2 == 8) {
                                    var ArrayClz = Java.use("java.lang.reflect.Array");
                                    var len = ArrayClz.getLength(obj);
                                    var obj2 = ArrayClz.get(obj, 0)
                                    fKLog.kLog({ name: "exprot", i2: i2, obj: obj2.toString() });

                                } else if (i2 == 12) {
                                    var ArrayClz = Java.use("java.lang.reflect.Array");
                                    var len = ArrayClz.getLength(obj);
                                    var obj2 = ArrayClz.get(obj, 0)
                                    var retMap = Java.cast(obj2, HashMap);
                                    if (retMap.containsKey(Integer.$new(55))) {

                                        fKLog.kLog({ name: "exprot", i2: i2, msg: "开始封装参数" });


                                        for (let key in edit_td_map) {
                                            retMap.put(Integer.$new(key), String.$new(edit_td_map2[key]))
                                        }
                                        var IntegerMap = {};
                                        IntegerMap[114] = 0;//adb_enabled 
                                        IntegerMap[200] = 2000;
                                        for (let key in IntegerMap) {
                                            retMap.put(Integer.$new(key), Integer.$new(IntegerMap[key]))
                                        }

                                        var boolMap = {};
                                        boolMap[85] = true;//虚拟定位是否关闭
                                        boolMap[45] = false;//root检测
                                        for (let key in boolMap) {
                                            retMap.put(Integer.$new(key), javaType.Javaboolean.$new(boolMap[key]))
                                        }
                                    }
                                    fKLog.kLog({ name: "exprot", i2: i2, map: JavaMapToObject(retMap) });//'exprot 12  obj: ' + JSON.stringify(JavaMapToObject(retMap))
                                } else {
                                    fKLog.kLog({ name: "exprot", i2: i2 });
                                }
                                if (i2 == 12) {
                                    showmemcpyLog = true;
                                    showmemcpytid = getTid();
                                }
                                let ret = this.n0(i2, obj);
                                if (i2 == 12) {
                                    // showmemcpyLog = false;
                                    var arr = Java.array("byte", ret);
                                    fKLog.kLog('exprot ret value is ' + i2 + " data: " + fkConvert.bytesToBase64(arr));
                                } else if (i2 == 8) {

                                    //fKLog.kLog( "exprot 2 sleep");
                                    //Thread.sleep(5);
                                    //fKLog.kLog( "exprot 2 begin");
                                    //ArrayClz.set(obj, 0, "113f80d9-5737-4889-bc96-55422c1d8ca8");
                                    //let ret22 = this.n0(2, obj);
                                    //fKLog.kLog( "exprot 2 end uuid:" + ret22);

                                    fKLog.kLog('exprot ret value is  ' + i2 + " " + ret + " ");
                                } else {
                                    fKLog.kLog('exprot ret value is ' + i2 + " " + ret);
                                }
                                if (i2 == 12) {
                                    showmemcpyLog = false;
                                }
                                return ret;
                            };

                            //let C10282kKkkKKKKk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.k\u20ADKKkkkK.kKk\u20ADkKK\u20AD\u20AD\u20ADKKk\u20AD");
                            //C10282kKkkKKKKk["K\u20AD\u20ADkk\u20ADK"].overload('android.content.Context').implementation = function (context) {
                            //    console.log(`24 is called: context=${context}`);
                            //    let result = this["K\u20AD\u20ADkk\u20ADK"](context);
                            //    console.log(`24 result=${result}`);
                            //    return result;
                            //};
                            //let C10326kkkkkKKkKk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.k\u20ADKKkkkK.\u20AD\u20AD\u20AD\u20ADk\u20AD\u20ADkkkkKKkK\u20AD\u20ADk");
                            //C10326kkkkkKKkKk["K\u20AD\u20ADkk\u20ADK"].overload('android.content.Context').implementation = function (context) {
                            //    console.log(`24_1 is called: context=${context}`);

                            //        showmemcpyLog = true;
                            //        showmemcpytid = getTid();

                            //    let result = this["K\u20AD\u20ADkk\u20ADK"](context);
                            //    showmemcpyLog = false;
                            //    console.log(`24_1 result=${result}`);
                            //    return result;
                            //};

                            //let C10299kkkkKKkk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.k\u20ADKKkkkK.k\u20ADkkkKKkk");
                            //C10299kkkkKKkk["KKkkkk\u20AD\u20ADK\u20ADk"].overload().implementation = function () {
                            //    console.log(`24_2 is called`);
                            //    let result = this["KKkkkk\u20AD\u20ADK\u20ADk"]();
                            //    console.log(`24_2 result=${result}`);
                            //    return result;
                            //};

                            let C0989kkkkkKKkKk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.k\u20ADKKkkkK.\u20AD\u20AD\u20AD\u20ADk\u20AD\u20ADkkkkKKkK\u20AD\u20ADk");
                            C0989kkkkkKKkKk["KKkkkk\u20AD\u20ADK\u20ADk"].overload('cn.tongdun.android.k₭KKkkkK.₭K₭₭kKkK.Kk₭KKKk', 'java.lang.String').implementation = function (v1, v2) {
                                fKLog.kLog('KKkkkk is called');
                                let ret = this["KKkkkk\u20AD\u20ADK\u20ADk"](v1, v2);
                                if (v2 == "complete")
                                    fKLog.kLog('KKkkkk ret value is ' + v2 + " " + ret + " " + fkConvert.bytesToBase64(ret));
                                else {
                                    let ret2 = this["KKkkkk\u20AD\u20ADK\u20ADk"](v1, v2);
                                    fKLog.kLog({ name: "kkkk", v2: v2, l1: ret, l2: ret2, ret: String.$new(ret, "utf-8").toString(), ret2: String.$new(ret2, "utf-8").toString() });
                                }
                                return ret;
                            };
                            let C0395kKkKK = Java.use("cn.tongdun.android.k\u20ADKKkkkK.k\u20ADKKkkkK.kKkK\u20ADK\u20AD");
                            C0395kKkKK["KKkkkk\u20AD\u20ADK\u20ADk"].overload().implementation = function () {
                                fKLog.kLog('td3_1 is called');
                                let ret = this["KKkkkk\u20AD\u20ADK\u20ADk"]();
                                fKLog.kLog('td3_1 ret value is ' + ret);
                                return ret;
                            };
                            let C0446kkkkkKKkKk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.k\u20ADKKkkkK.\u20AD\u20AD\u20AD\u20ADk\u20AD\u20ADkkkkKKkK\u20AD\u20ADk");
                            C0446kkkkkKKkKk["k\u20ADKKkkkK"].overload('android.content.Context').implementation = function (context) {
                                let ret = this["k\u20ADKKkkkK"](context);
                                fKLog.kLog('td3_2 ret value is ' + ret);
                                return ret;
                            };
                            let C0397kKkkKKKKk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.k\u20ADKKkkkK.kKk\u20ADkKK\u20AD\u20AD\u20ADKKk\u20AD");
                            C0397kKkkKKKKk["KKkkkk\u20AD\u20ADK\u20ADk"].overload('android.content.Context').implementation = function (context) {
                                let ret = this["KKkkkk\u20AD\u20ADK\u20ADk"](context);
                                fKLog.kLog('td3_3 ret value is ' + ret);
                                return ret;
                            };

                            let C0384KkkkKkkk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.k\u20ADKKkkkK.Kk\u20AD\u20AD\u20AD\u20ADk\u20ADkKkk\u20ADk\u20AD");
                            C0384KkkkKkkk["KKkkkk\u20AD\u20ADK\u20ADk"].overload('android.content.Context').implementation = function (context) {
                                let result = this["KKkkkk\u20AD\u20ADK\u20ADk"](context);
                                fKLog.kLog(`C0384KkkkKkkk.m268KKkkkkKk result=${result}`);
                                return result;
                            };
                            C0384KkkkKkkk["k\u20ADKKkkkK"].overload('android.content.Context').implementation = function (context) {
                                let result = this["k\u20ADKKkkkK"](context);
                                fKLog.kLog(`C0384KkkkKkkk.get_td_client_id_3 result=${result}`);
                                return result;
                            };
                            C0384KkkkKkkk["\u20ADk\u20ADkKKk\u20ADkkK\u20AD\u20ADk\u20AD"].overload('android.content.Context').implementation = function (context) {
                                let result = this["\u20ADk\u20ADkKKk\u20ADkkK\u20AD\u20ADk\u20AD"](context);
                                fKLog.kLog(`C0384KkkkKkkk.get_td_client_id_3_file result=${result}`);
                                return result;
                            };
                            let KkkkKkkKkkKkkK = Java.use("cn.tongdun.android.k\u20ADKKkkkK.k\u20ADKKkkkK.KkkkKkk\u20ADKk\u20AD\u20ADkKkkK");
                            KkkkKkkKkkKkkK["Kkk\u20ADkK\u20ADK\u20ADK"].implementation = function (context) {
                                console.log(`KkkkKkkKkkKkkK.m249KkkkKKK  tdck_fileis called: context=${context}`);
                                let result = this["Kkk\u20ADkK\u20ADK\u20ADK"](context);
                                console.log(`KkkkKkkKkkKkkK.m249KkkkKKK  tdck_file result=${result}`);
                                return result;
                            };

                            let C0352kkkKkk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.KKKkkK\u20AD\u20ADK\u20ADK.kk\u20AD\u20ADkKkk");
                            C0352kkkKkk["KKkkkk\u20AD\u20ADK\u20ADk"].overload('java.io.File').implementation = function (file) {
                                console.log(`C0352kkkKkk.m149KKkkkkKk td_file is called: file=${file}`);
                                let result = this["KKkkkk\u20AD\u20ADK\u20ADk"](file);
                                console.log(`C0352kkkKkk.m149KKkkkkKk td_file result=${result}`);
                                return result;
                            };

                            let KkkkKkkk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.KKKkkK\u20AD\u20ADK\u20ADK.Kk\u20AD\u20AD\u20AD\u20ADk\u20ADkKkk\u20ADk\u20AD");
                            KkkkKkkk["KKkkkk\u20AD\u20ADK\u20ADk"].overload('[Ljava.lang.String;').implementation = function (strArr) {
                                let result = this["KKkkkk\u20AD\u20ADK\u20ADk"](strArr);
                                console.log(`check Arrary result=${result}`);
                                return result;
                            };

                            //let C0989kkkkkKKkKk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.k\u20ADKKkkkK.\u20AD\u20AD\u20AD\u20ADk\u20AD\u20ADkkkkKKkK\u20AD\u20ADk");
                            //C0989kkkkkKKkKk["\u20ADK\u20AD\u20ADkKkK"].overload().implementation = function () {
                            //    fKLog.kLog( '\u20ADK\u20AD\u20ADkKkK is called');
                            //    let ret = this["\u20ADK\u20AD\u20ADkKkK"]();
                            //    fKLog.kLog( '\u20ADK\u20AD\u20ADkKkK ret value is ' + ret);
                            //    return ret;
                            //};
                            //let KKkkkkKk = Java.use("cn.tongdun.android.k\u20ADKKkkkK.KKkkkk\u20AD\u20ADK\u20ADk");
                            //KKkkkkKk["KKkkkk\u20AD\u20ADK\u20ADk"].overload('java.lang.String').implementation = function (blackboxData) {
                            //    fKLog.kLog( 'KKkkkk\u20AD\u20ADK\u20ADk is called' + ', ' + 'blackboxData: ' + blackboxData);
                            //    let ret = this["KKkkkk\u20AD\u20ADK\u20ADk"](blackboxData);
                            //    fKLog.kLog( 'KKkkkk\u20AD\u20ADK\u20ADk ret value is ' + ret);
                            //    return ret;
                            //};

                            load = true;
                            fKLog.kLog("diy.js init hook success")
                        }
                    }
                    catch {

                    }

                }
            });
        }
    }

    function showExport(inputModule) {
        var cnt = 0;
        var m_keyInfo;
        var m_index;
        var m_fileds_info;
        var call_count = [];
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
                        //if (edata.name == "SBOX") {
                        //    fKLog.kLog("导出字段" + edata.name + " => " + edata.address.readCString());
                        //    var u8 = new Uint8Array(edata.address.readByteArray(64), { length: 64 });
                        //    fKLog.kLog({ name: "SBOX", BASE64: fkConvert.bytesToBase64(u8) });
                        //} else {
                        //    fKLog.kLog("导出字段" + edata.name + " => " + edata.address.readCString());
                        //}
                        return;
                    }
                    if (edata.name == "JNI_OnLoad") {
                        return;
                    }
                    //if (edata.name == "fizAQZIKbswZEwdkUYdmoHiDY") {
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg2 = args[1];
                    //            this.arg1 = args[0];
                    //            fKLog.kLog({ name: "fizAQZIKbswZEwdkUYdmoHiDY", arg2: fkConvert.bytesToHex(new Uint8Array(this.arg2.readByteArray(64))), arg1: fkConvert.bytesToHex(new Uint8Array(this.arg1.readByteArray(32))) },this.context)
                    //        }, onLeave: function (retval) {
                    //            fKLog.kLog({ name: "fizAQZIKbswZEwdkUYdmoHiDY", retval: fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(32))), arg1: fkConvert.bytesToHex(new Uint8Array(this.arg1.readByteArray(32))) })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)),this.context)
                    //        }
                    //    });
                    //    return
                    //}
                    //if (edata.name == "KRgHbrzEpFoQtqtPxdNwwAUDSZri") {
                    //    //td 2
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg2 = args[1];
                    //            this.arg1 = args[0];
                    //            fKLog.kLog( { name: "KRgHbrzEpFoQtqtPxdNwwAUDSZri", arg2: this.arg2, arg1: fkConvert.bytesToHex(new Uint8Array(this.arg1.readByteArray(args[2] - 0))) })
                    //        }, onLeave: function (retval) {
                    //            fKLog.kLog( { name: "KRgHbrzEpFoQtqtPxdNwwAUDSZri", retval: retval, arg2: this.arg2.readInt(), arg1: this.arg1.readCString() })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //        }
                    //    });
                    //    return
                    //}

                    if (edata.name == "GoEEcYkyTaQKaFPtvXs") {

                        Interceptor.attach(edata.address, {
                            onEnter: function (args) {
                                this.arg1 = args[0];
                                this.arg2 = args[1];
                                var old = this.arg2.readCString();
                                var key = this.arg1 - 0;
                                if (edit_td_map2[key] != null) {
                                    this.arg2.writeByteArray(fkConvert.hexToBytes(fkConvert.stringToHex(edit_td_map2[key])));
                                }
                                var newstr = this.arg2.readCString();

                                if (newstr != old)
                                    console.log({ name: "td_push", new: newstr, old: old });
                                else
                                    console.log({ name: "td_push", id: key, map: "" + edit_td_map2[key], old: old });
                            }, onLeave: function (retval) {
                            }
                        });
                        return
                    }

                    //if (edata.name == "BwcyNfQHMuZezIOOWHuqwNZHemdzQ") {
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg2 = args[1];
                    //            this.arg3 = args[2];
                    //            this.arg1 = args[0];
                    //        }, onLeave: function (retval) {
                    //            fKLog.kLog( { name: "sm3 ", retval: retval, arg2: this.arg2, arg1: fkConvert.bytesToHex(new Uint8Array(this.arg1.readByteArray(this.arg2 - 0))), arg3: fkConvert.bytesToHex(new Uint8Array(this.arg3.readByteArray(64))) })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //        }
                    //    });
                    //    return
                    //}
                    //if (edata.name == "zfxxFWFdOnUNWFenRNRVNCU") {
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg1 = args[0];
                    //            fKLog.kLog( { name: "td_strlen", arg1: this.arg1.readCString() })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //        }, onLeave: function (retval) {
                    //        }
                    //    });
                    //    return
                    //}

                    //if (edata.name == "mtiFevrUmhEpnJnvAFpIvTI") {
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg2 = args[1];
                    //            this.arg1 = args[0];
                    //            fKLog.kLog( { name: "zip mtiFevrUmhEpnJnvAFpIvTI" })
                    //        }, onLeave: function (retval) {
                    //            fKLog.kLog( { name: "zip leave mtiFevrUmhEpnJnvAFpIvTI", retval: retval })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //        }
                    //    });
                    //    return
                    //}
                    //if (edata.name == "MLvujIkLumRmVvjCgzcwRPxxn") {
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg2 = args[1];
                    //            this.arg1 = args[0];
                    //            fKLog.kLog( { name: "zip MLvujIkLumRmVvjCgzcwRPxxn" })
                    //        }, onLeave: function (retval) {
                    //            fKLog.kLog( { name: "zip leave MLvujIkLumRmVvjCgzcwRPxxn", retval: retval })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //        }
                    //    });
                    //    return
                    //}
                    //if (edata.name == "guAbirFDBqWLukDiZgqUWDGMTZhSJCgV") {
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg2 = args[1];
                    //            this.arg1 = args[0];
                    //            fKLog.kLog( { name: "zip guAbirFDBqWLukDiZgqUWDGMTZhSJCgV" })
                    //        }, onLeave: function (retval) {
                    //            fKLog.kLog( { name: "zip leave guAbirFDBqWLukDiZgqUWDGMTZhSJCgV", retval: retval })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //        }
                    //    });
                    //    return
                    //}
                    //if (edata.name == "EkjOcuniKiOLLjQCiqOCkpHZqCgWFILA") {
                    //    //bytetohexstring
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg2 = args[1];
                    //            this.arg1 = args[0];
                    //            fKLog.kLog( { name: "bytetohexstring", arg2: this.arg2, arg1: fkConvert.bytesToHex(new Uint8Array(this.arg2.readByteArray(args[2] - 0))) })
                    //        }, onLeave: function (retval) {
                    //            fKLog.kLog( { name: "bytetohexstring", retval: retval, arg2: this.arg2.readInt(), arg1: this.arg1.readCString() })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //        }
                    //    });
                    //    return
                    //}

                    //var showqdluKAjiUhJWYUDRwJRDkwerO = false;
                    //if (edata.name == "ywnewQmwzwzRYIdpmK") {
                    //    //td 18
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            showqdluKAjiUhJWYUDRwJRDkwerO = true;
                    //            this.arg1 = args[0];
                    //            fKLog.kLog( { name: "ywnewQmwzwzRYIdpmK", arg1: this.arg1.readCString() })
                    //        }, onLeave: function (retval) {
                    //            fKLog.kLog( { name: "ywnewQmwzwzRYIdpmK", retval: retval, arg1: this.arg1.readCString() })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //            showqdluKAjiUhJWYUDRwJRDkwerO = false;
                    //        }
                    //    });
                    //    return
                    //}
                    //if (edata.name == "qdluKAjiUhJWYUDRwJRDkwerO") {
                    //    //td strstr
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg2 = args[1];
                    //            args[1] = args[0];
                    //            this.arg1 = args[0]; 
                    //        }, onLeave: function (retval) {
                    //            if (retval != 0)
                    //                fKLog.kLog( { name: "strstr", retval: retval.readCString(), arg2: this.arg2.readCString(), arg1: this.arg1.readCString() })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //            else
                    //                fKLog.kLog( { name: "strstr", retval: retval, arg2: this.arg2.readCString(), arg1: this.arg1.readCString() })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //        }
                    //    });
                    //    return
                    //}

                    //if (edata.name == "xLdhalbKsABdBqaehEiw") {
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg2 = args[1];
                    //            this.arg1 = args[0];
                    //            //this.arg1.writeByteArray([1, 1, 1, 1]);
                    //            //this.arg2 = 4;
                    //        }, onLeave: function (retval) {
                    //            fKLog.kLog( { name: "xLdhalbKsABdBqaehEiw", retval: retval, arg2: this.arg2 })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //        }
                    //    });
                    //    return
                    //}
                    //if (edata.name == "VcclwzPGoEApDXNgtxKfZYWPtUJyUE") {
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg2 = args[1];
                    //            this.arg1 = args[0];
                    //        }, onLeave: function (retval) {
                    //            var ppp = ptr(m_keyInfo).readPointer();
                    //            var size = ptr(m_index).readInt();
                    //            var fileds_info = ptr(m_fileds_info).readPointer();
                    //            fKLog.kLog( { name: "VcclwzPGoEApDXNgtxKfZYWPtUJyUE", keyInfo: fkConvert.bytesToHex(new Uint8Array(ppp.readByteArray(size))), fileds_info: fkConvert.bytesToHex(new Uint8Array(fileds_info.readByteArray(size * 4))) })//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //        }
                    //    });
                    //    return
                    //}
                    //if (edata.name == "nQLmyQLYySPjdJzcnVH") {
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg2 = args[1];
                    //            this.arg1 = args[0];
                    //        }, onLeave: function (retval) {
                    //            var ppp = ptr(m_keyInfo).readPointer();
                    //            //var vvv = [];
                    //            //for (var i = 0; i < 256; i++) {
                    //            //    vvv.push(1);
                    //            //}
                    //            ppp.writeByteArray(vvv);
                    //            fKLog.kLog( "nQLmyQLYySPjdJzcnVH  m_keyInfo retVal: " + retval + " " + fkConvert.bytesToHex(new Uint8Array(ppp.readByteArray(256))))//+ fkConvert.bytesToHex(new Uint8Array(retval.readByteArray(100)))
                    //        }
                    //    });
                    //    return
                    //}
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
                                fKLog.kLog("compress3   " + this.arg2.readInt() + " " + fkConvert.bytesToHex(new Uint8Array(this.arg3.readByteArray(this.arg4 - 0))), this.context)
                            }, onLeave: function (retval) {
                                fKLog.kLog("compress3  retval " + retval + " " + this.arg2 + " " + this.arg2.readInt() + " " + fkConvert.bytesToHex(new Uint8Array(this.arg1.readByteArray(this.arg2.readInt()))), this.context)
                            }
                        });
                        return;
                    }

                    if (edata.name == "compressNS") {
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
                                fKLog.kLog("compressNS   " + fkConvert.bytesToHex(new Uint8Array(this.arg3.readByteArray(this.arg4 - 0))), this.context)
                            }, onLeave: function (retval) {
                                fKLog.kLog("compressNS  retval " + this.arg2 + " " + this.arg2.readInt() + " " + fkConvert.bytesToHex(new Uint8Array(this.arg1.readByteArray(this.arg2.readInt()))), this.context)
                            }
                        });
                        return;
                    }
                    if (edata.name == "TgnisnPxZRczxWIZPup") {
                        Interceptor.attach(edata.address, {
                            onEnter: function (args) {
                                this.arg1 = args[0];
                                this.arg2 = args[1];
                                this.arg3 = args[2];
                                this.arg4 = args[3];
                                this.arg5 = args[4];
                                this.arg6 = args[5];
                            }, onLeave: function (retval) {
                                //var v = [];
                                //for (var i = 0; i < 64; i++) {
                                //    v.push(47 + i);
                                //}
                                //this.arg2.writeByteArray(v)
                                //var st = Memory.alloc(8);
                                //st.writeByteArray([1, 2, 3, 4, 5, 6, 7, 8]);
                                //this.arg2 = st;
                                //this.arg3 = 8;
                                //fKLog.kLog( "TgnisnPxZRczxWIZPup  st  " + fkConvert.bytesToHex(new Uint8Array(st.readByteArray(8))))

                                fKLog.kLog(
                                    {
                                        name: "td_encode sm4",
                                        retval: fkConvert.bytesToHex(new Uint8Array(this.arg2.readByteArray(this.arg3 - 0))),
                                        arg1: fkConvert.bytesToHex(new Uint8Array(this.arg1.readByteArray(this.arg3 - 0))),
                                        arg2: this.arg2,
                                        arg3: this.arg3,
                                        arg4: fkConvert.bytesToHex(new Uint8Array(this.arg4.readByteArray(128))),
                                        arg5: fkConvert.bytesToHex(new Uint8Array(this.arg5.readByteArray(16))),
                                        arg6: this.arg6
                                    }, this.context)
                            }
                        });
                    }
                    if (edata.name == "tjjJSWnpopcaEUFocvH") {
                        Interceptor.attach(edata.address, {
                            onEnter: function (args) {
                                this.arg2 = args[1];
                                this.arg1 = args[0];
                            }, onLeave: function (retval) {

                                fKLog.kLog({ name: "sm4 key", arg1: this.arg1.readCString(), arg2: this.arg2.readCString() }, this.context)
                            }
                        });
                        return;
                    }
                    //if (edata.name == "tjjJSWnpopcaEUFocvH") {
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg1 = args[0];
                    //            this.arg2 = args[1];
                    //            this.arg3 = args[2];
                    //            fKLog.kLog( { name: "tjjJSWnpopcaEUFocvH", arg1: fkConvert.bytesToHex(new Uint8Array(this.arg1.readByteArray(128))), arg2: fkConvert.bytesToHex(new Uint8Array(this.arg2.readByteArray(32))) });
                    //        }, onLeave: function (retval) {
                    //            fKLog.kLog( "tjjJSWnpopcaEUFocvH  retval  " + fkConvert.bytesToHex(new Uint8Array(this.arg1.readByteArray(128))))
                    //        }
                    //    });
                    //}
                    //if (edata.name == "kvlcZBNLehpNtIWeYxTxrgQ") {
                    //    Interceptor.attach(edata.address, {
                    //        onEnter: function (args) {
                    //            this.arg1 = args[0];
                    //            this.arg2 = args[1];
                    //            this.arg3 = args[2];
                    //            fKLog.kLog( { name: "kvlcZBNLehpNtIWeYxTxrgQ", arg1: fkConvert.bytesToHex(new Uint8Array(this.arg1.readByteArray(16))), arg2: fkConvert.bytesToHex(new Uint8Array(this.arg1.readByteArray(16))), arg3: fkConvert.bytesToHex(new Uint8Array(this.arg3.readByteArray(128))) });
                    //        }, onLeave: function (retval) {
                    //            fKLog.kLog( "kvlcZBNLehpNtIWeYxTxrgQ  retval  " + fkConvert.bytesToHex(new Uint8Array(this.arg2.readByteArray(16))))
                    //        }
                    //    });
                    //}

                    return;

                    cnt += 1;
                    fKLog.kLog(cnt + ": module:" + module.name + "----exportName:" + edata.name + "----address:" + edata.address + "----type:" + edata.type)
                    Interceptor.attach(edata.address, {
                        onEnter: function (args) {
                            this.arg1 = args[0];
                            this.arg2 = args[1];
                            this.arg3 = args[3];
                            this.arg4 = args[4];
                            this.arg5 = args[5];
                            if (call_count[edata.name] == null)
                                call_count[edata.name] = 0;

                            call_count[edata.name]++;
                            if (call_count[edata.name] < 10) {
                                var arrary = [this.arg1, this.arg2, this.arg3, this.arg4, this.arg5];
                                var logs = {};
                                for (var i = 0; i < arrary.length; i++) {
                                    var key = "arg" + i;
                                    try {
                                        logs[key] = arrary[i].readCString();
                                        logs[key + "Hex"] = fkConvert.bytesToHex(new Uint8Array(arrary[i].readByteArray(32)));
                                    }
                                    catch {
                                        logs[key] = arrary[i];
                                    }
                                }
                                logs["name"] = edata.name;
                                fKLog.kLog(logs, this.context);
                            }

                        }, onLeave: function (retval) {
                            if (call_count[edata.name] < 10) {
                                var arrary = [retval, this.arg1, this.arg2, this.arg3, this.arg4, this.arg5];
                                var logs = {};
                                for (var i = 0; i < arrary.length; i++) {
                                    var key = "arg" + i;
                                    if (i == 0) {
                                        key = "retVal";
                                    }
                                    try {
                                        logs[key] = arrary[i].readCString();
                                        logs[key + "Hex"] = fkConvert.bytesToHex(new Uint8Array(arrary[i].readByteArray(32)));

                                    }
                                    catch {
                                        logs[key] = arrary[i];
                                    }
                                }
                                logs["name"] = edata.name;
                                fKLog.kLog(logs, this.context)
                            }
                        }
                    });
                }
                catch {
                }
            });
        });
    }
    var library_name = "libtongdun.so";
    var isSpawn = false;
    var library_loaded = 0;
    if (isSpawn) {
        Interceptor.attach(Module.findExportByName(null, 'android_dlopen_ext'), {
            onEnter: function (args) {
                // first arg is the path to the library loaded
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
    function main() {
        dump_dex();
    }

    setImmediate(main);
})();
