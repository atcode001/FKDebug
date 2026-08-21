(function () {

    if (Java.available) {
        Java.perform(function () {
            fKLog.kLog('ZenTracer Start...');
            var matchRegEx = [MATCHREGEX];
            var blackRegEx = [BLACKREGEX];
            var hookBacklist = [];
            var hookList = [];
            var hookmap = {};
            Java.enumerateLoadedClasses({
                onMatch: function (aClass) {
                    for (var index in matchRegEx) {
                        if (match(matchRegEx[index], aClass)) {

                            var is_black = false;
                            for (var i in blackRegEx) {
                                if (match(blackRegEx[i], aClass)) {
                                    is_black = true;
                                    hookBacklist.push(aClass)
                                    break;
                                }
                            }
                            if (is_black) {
                                break;
                            }
                            hookList.push(matchRegEx[index])
                            traceClass(aClass);
                            hookmap[aClass] = true;
                        }
                    }
                },
                onComplete: function () {
                    fKLog.kLog("Complete.");
                }
            });
            fKLog.kLog("Hook", hookList);
            fKLog.kLog("UnHook", hookBacklist);
            for (var index in matchRegEx) {
                var aClass = matchRegEx[index];
                if (aClass[0] != '*' && (hookmap[aClass] == undefined || hookmap[aClass] == null)) {
                    traceClass(aClass);
                }
            }
        });
    }
    function fKLog.kLog(msg) {
        var message = {};
        message["jsname"] = "ZenTracer";
        message["msg"] = msg;
        send(message);
    }
    function fKLog.kLog(msg, data) {
        var message = {};
        message["jsname"] = "ZenTracer";
        message["msg"] = msg;
        message["data"] = data;
        send(message);
    }
    function enter(tid, tname, cls, method, args) {
        var packet = {
            'cmd': 'enter',
            'data': [tid, tname, cls + "." + method, args]
        };
        fKLog.kLog(packet)
    }

    function exit(tid, cls, method, retval) {
        var packet = {
            'cmd': 'exit',
            'data': [tid, cls + "." + method, retval]
        };
        fKLog.kLog(packet)
    }

    function getTid() {
        var Thread = Java.use("java.lang.Thread")
        return Thread.currentThread().getId();
    }

    function getTName() {
        var Thread = Java.use("java.lang.Thread")
        return Thread.currentThread().getName();
    }

    function traceClass(clsname) {
        try {
            var target = Java.use(clsname);
            var methods = target.class.getDeclaredMethods();
            var hookItems = [];
            methods.forEach(function (method) {
                var methodName = method.getName();
                var overloads = target[methodName].overloads;

                overloads.forEach(function (overload) {
                    var proto = "(";
                    overload.argumentTypes.forEach(function (type) {
                        proto += type.className + ", ";
                    });
                    if (proto.length > 1) {
                        proto = proto.substr(0, proto.length - 2);
                    }
                    proto += ")";
                    hookItems.push(clsname + "." + methodName + proto);
                    overload.implementation = function () {
                        var args = [];
                        var tid = getTid();
                        var tName = getTName();
                        for (var j = 0; j < arguments.length; j++) {
                            args[j] = arguments[j] + ""
                        }
                        enter(tid, tName, clsname, methodName + proto, args);
                        var retval = this[methodName].apply(this, arguments);
                        exit(tid, clsname, methodName + proto, retval);
                        return retval;
                    }

                });
            });
            if (hookItems.length > 0)
                fKLog.kLog("hooking: ", hookItems);
        } catch (e) {
            fKLog.kLog("'" + clsname + "' hook fail: " + e)
        }
    }

    function match(ex, text) {
        if (ex[0] == '*') {
            ex = ex.substr(1, ex.length - 1);
            return text.indexOf(ex) != -1;
        }
        return ex == text;
    }

})();
