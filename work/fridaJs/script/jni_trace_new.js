(function () {

    function fKLog.kLog(data, ...args) {
        for (let item of args) {
            data += "\t" + item;
        }
        var message = {};
        message["jsname"] = "jni_trace_new";
        message["data"] = data;
        send(message);
    }



    var library_name = "libnesdk.so" // ex: libsqlite.so
    var function_name = "JNI_OnLoad" // ex: JNI_OnLoad
    var isSpawn = true;
    var library_loaded = 0

    // Function that will process the JNICall after calculating it from
    // the jnienv pointer in args[0]
    function hook_jni(library_name, function_name) {

        // To get the list of exports
        Module.enumerateExportsSync(library_name).forEach(function (symbol) {
            if (symbol.name == function_name) {
                fKLog.kLog("[...] Hooking : " + library_name + " -> " + function_name + " at " + symbol.address)

                Interceptor.attach(symbol.address, {
                    onEnter: function (args) {



                        Interceptor.attach(jni.getJNIFunctionAdress(jnienv_addr, "FindClass"), {
                            onEnter: function (args) {
                                fKLog.kLog("env->FindClass(\"" + Memory.readCString(args[1]) + "\")")
                            }
                        })
                    },
                    onLeave: function (args) {
                        // Prevent from displaying junk from other functions
                        Interceptor.detachAll()
                        fKLog.kLog("[-] Detaching all interceptors")
                    }
                })
            }
        })
    }



    if (library_name == "" || function_name == "") {
        fKLog.kLog("[-] You must provide a function name and a library name to hook");
    } else {
        if (isSpawn) {
            Interceptor.attach(Module.findExportByName(null, 'android_dlopen_ext'), {
                onEnter: function (args) {
                    // first arg is the path to the library loaded
                    var library_path = Memory.readCString(args[0])

                    if (library_path.includes(library_name)) {
                        fKLog.kLog("[...] Loading library : " + library_path)
                        library_loaded = 1
                    }
                },
                onLeave: function (args) {

                    // if it's the library we want to hook, hooking it
                    if (library_loaded == 1) {
                        fKLog.kLog("[+] Loaded")
                        hook_jni(library_name, function_name)
                        library_loaded = 0
                    }
                }
            })
        } else {
            hook_jni(library_name, function_name);
        }
    }
})();
