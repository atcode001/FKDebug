//https://blog.csdn.net/CharlesSimonyi/article/details/90518367
// 使用谷歌浏览器 打开 chrome://inspect/#devices


Java.perform(function () {
    var WebView = Java.use("android.webkit.WebView");

    //重写WebView类的重载方法，因为setWebContentsDebuggingEnabled不是静态方法，所以需要一个对象来调用这个方法
    WebView.$init.overload('android.content.Context').implementation = function (a) {
        fKLog.kCLog("WebView.$init is called!1");
        var retval = this.$init(a);
        this.setWebContentsDebuggingEnabled(true);
        return retval;
    }
    WebView.$init.overload('android.content.Context', 'android.util.AttributeSet').implementation = function (a, b) {
        fKLog.kCLog("WebView.$init is called!2");
        var retval = this.$init(a, b);
        this.setWebContentsDebuggingEnabled(true);
        return retval;
    }
    WebView.$init.overload('android.content.Context', 'android.util.AttributeSet', 'int').implementation = function (a, b, c) {
        fKLog.kCLog("WebView.$init is called!3");
        var retval = this.$init(a, b, c);
        this.setWebContentsDebuggingEnabled(true);
        return retval;
    }
    WebView.setWebContentsDebuggingEnabled.overload("boolean").implementation = function (s) {
        fKLog.kCLog("WebView.setWebContentsDebuggingEnabled is called!");
        this.setWebContentsDebuggingEnabled(true);
    };



    WebView.loadUrl.overload('java.lang.String').implementation = function(url) {
        fKLog.kCLog("[*] WebView loading URL: " + url);
        fKLog.kCLog("[*] User-Agent: " + this.getSettings().getUserAgentString());
        return this.loadUrl(url);
    };

    // Hook WebSettings
    var WebSettings = Java.use('android.webkit.WebSettings');
    // WebSettings.setAcceptLanguage.implementation = function(language) {
    //     console.log("[*] WebSettings.setAcceptLanguage: " + language);
    //     // 修改为中文
    //     return this.setAcceptLanguage('zh-CN,zh;q=0.9,en;q=0.8');
    // };

    // WebSettings.getAcceptLanguage.implementation = function() {
    //     var original = this.getAcceptLanguage();
    //     console.log("[*] getAcceptLanguage: " + original);
    //     return 'zh-CN,zh;q=0.9'; // 总是返回中文
    // };
    var WebViewClient = Java.use('android.webkit.WebViewClient');

    WebViewClient.shouldInterceptRequest.overload('android.webkit.WebView', 'java.lang.String').implementation = function(webView, url) {
        console.log("[*] WebView request: " + url);
        return this.shouldInterceptRequest(webView, url);
    };
    function JavaMapToObject(map) {
        var keyset = map.keySet();
        var it = keyset.iterator();
        var map_dic = {};
        while (it.hasNext()) {
            var keystr = it.next();
            var v = map.get(keystr);
            if (v != null)
            map_dic[keystr] = v.toString();
            else
            map_dic[keystr] = null;
        }
        return map_dic;
    }
    WebViewClient.shouldInterceptRequest.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest').implementation = function(webView, request) {
        var url = request.getUrl().toString(); 
        // 获取请求头
        var headers = request.getRequestHeaders();  
        fKLog.kCLog( {url:url, name:"WebResourceRequest headers", value:JavaMapToObject(headers)});
        return this.shouldInterceptRequest(webView, request);
    };
    
    
    fKLog.kCLog("WebView.setWebContentsDebuggingEnabled is called!");
})
