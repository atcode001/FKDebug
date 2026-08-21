//typed by hanbingle,just for fun!!
//email:edunwu@gmail.com
//只是对Android 8 版本进行了测试，其他版本请自行移植
/*使用说明
首先拷贝fart.so和fart64.so到/data/app目录下，并使用chmod 777 设置好权限,然后就可以使用了。
该Fkida版fart是使用hook的方式实现的函数粒度的脱壳，仅仅是对类中的所有函数进行了加载，但依然可以解决绝大多数的抽取保护
需要以spawn方式启动app，等待app进入Activity界面后，执行fart()函数即可。如app包名为com.example.test,则
Fkida -U -f com.example.test -l Fkida_fart_hook.js --no-pause，然后等待app进入主界面,执行fart()
高级用法：如果发现某个类中的函数的CodeItem没有dump下来，可以调用dump(classname),传入要处理的类名，完成对该类下的所有函数体的dump,dump下来的函数体会追加到bin文件当中。
 */
var ishook_libart = false;
var addrLoadMethod = null;
var addrGetCodeItemLength = null;
var funcGetCodeItemLength = null;
var addrBase64_encode = null;
var funcBase64_encode = null;
var addrFreeptr = null;
var funcFreeptr = null;
var dex_maps = {};
var artmethod_maps = [];
var dumpCount = 0;
var data_cache = {};

function sendData(dataType, data) {
    //if (data_cache[dataType.address] != null) {
    //    var olddata = data_cache[dataType.address];
    //    var isSend = false;
    //    for (var i = 0; i < dataType.size; i++) {
    //        if (olddata[i] != data[i]) {
    //            isSend = true;
    //            break;
    //        }
    //    }
    //    if (!isSend) {
    //        fKLog.kLog("文件" + dataType.address + "未发生变化放弃保存");
    //        return;
    //    }
    //}
    //data_cache[dataType.address] = data;
    var message = {};
    message["jsname"] = "fart";
    message["data"] = dataType;
    send(message, data);
}
function DexFile(start, size) {
    this.start = start;
    this.size = size;
    this.dumpCount = 0;
}

function ArtMethod(dexfile, artmethodptr) {
    this.dexfile = dexfile;
    this.artmethodptr = artmethodptr;
}
function hookart() {
    fKLog.kLog("Fkida_fart.js init hook success");
    if (ishook_libart === true) {
        return;
    }
    var module_libext = null;
    if (Process.arch === "arm64") {
        module_libext = Module.load("/data/app/fart64.so");
    } else if (Process.arch === "arm") {
        module_libext = Module.load("/data/app/fart.so");
    }
    fKLog.kLog("Fkida_fart 加载完成 ");
    if (module_libext != null) {
        addrGetCodeItemLength = module_libext.findExportByName("GetCodeItemLength");
        funcGetCodeItemLength = new NativeFunction(addrGetCodeItemLength, "int", ["pointer"]);
        addrBase64_encode = module_libext.findExportByName("Base64_encode");
        funcBase64_encode = new NativeFunction(addrBase64_encode, "pointer", ["pointer", "int", "pointer"]);
        addrFreeptr = module_libext.findExportByName("Freeptr");
        funcFreeptr = new NativeFunction(addrFreeptr, "void", ["pointer"]);
    }
    var symbol_name_s = ["_ZN3art11ClassLinker10LoadMethodERKNS_7DexFileERKNS_13ClassAccessor6MethodENS_6HandleINS_6mirror5ClassEEEPNS_9ArtMethodE",
        "_ZN3art11ClassLinker10LoadMethodERKNS_7DexFileERKNS_21ClassDataItemIteratorENS_6HandleINS_6mirror5ClassEEEPNS_9ArtMethodE"];
    var symbol_name = "";
    for (var i = 0; i < symbol_name_s.length; i++) {
        symbol_name = symbol_name_s[i];
        addrLoadMethod = Module.findExportByName("libart.so", symbol_name);
        if (addrLoadMethod != null)
            break;
    }
    var IsFind = false;
    if (addrLoadMethod == null) {
        IsFind = true;
        var symbols = Module.enumerateSymbolsSync("libart.so");
        for (var i = 0; i < symbols.length; i++) {
            var symbol = symbols[i];
            if (symbol.name.indexOf("ClassLinker") >= 0
                && symbol.name.indexOf("LoadMethod") >= 0
                && symbol.name.indexOf("DexFile") >= 0
                && (symbol.name.indexOf("ClassAccessor") >= 0 || symbol.name.indexOf("ClassDataItemIterator") > 0)
                && symbol.name.indexOf("ArtMethod") >= 0) {
                addrLoadMethod = symbol.address;
                symbol_name = symbol.name;
                break;
            }
        }
    }
    fKLog.kLog("Init LoadMethod", { androidVersion: Java.androidVersion, name: "LoadMethod", symbol_name, address: addrLoadMethod, IsFind })
    if (addrLoadMethod != null) {
        Interceptor.attach(addrLoadMethod, {
            onEnter: function (args) {
                this.dexfileptr = args[1];
                this.artmethodptr = args[4];
            },
            onLeave: function (retval) {
                if (this.dexfileptr == null)
                    return;

                var dexfilebegin = Memory.readPointer(ptr(this.dexfileptr).add(Process.pointerSize * 1));
                var dexfilesize = Memory.readU32(ptr(this.dexfileptr).add(Process.pointerSize * 2));

                if (dex_maps[dexfilebegin] == undefined) {
                    dex_maps[dexfilebegin] = dexfilesize;

                    var dex_buffer = ptr(dexfilebegin).readByteArray(dexfilesize);
                    sendData({ name: "load_dex", address: dexfilebegin, size: dexfilesize }, dex_buffer)
                }

                if (this.artmethodptr != null && artmethod_maps[this.artmethodptr] == undefined) {
                    var dexfileobj = new DexFile(dexfilebegin, dexfilesize);
                    var artmethodobj = new ArtMethod(dexfileobj, this.artmethodptr);
                    artmethod_maps[this.artmethodptr] = artmethodobj;
                }
            }
        });
    }
    ishook_libart = true;
    //dumpclass("com.test.cn")
}
var dumpCountmap = {};
function dumpcodeitem(artmethodobj) {
    if (artmethodobj == null)
        return;

    var dexfileobj = artmethodobj.dexfile;
    var dexfilebegin = dexfileobj.start;
    var dexfilesize = dexfileobj.size;

    if (dumpCountmap[dexfilebegin] == undefined)
        dumpCountmap[dexfilebegin] = 0;

    if (dumpCountmap[dexfilebegin] < dumpCount) {
        dumpCountmap[dexfilebegin]++;
        var dex_buffer = ptr(dexfilebegin).readByteArray(dexfilesize);
        sendData({ name: "save_dex", address: dexfilebegin, size: dexfilesize, dumpCount: dumpCountmap[dexfilebegin] }, dex_buffer);
    }
}

function dumpall() {
    try {
        dumpCount++;
        fKLog.kLog("start dump all CodeItem.......")
        for (var artmethodptr in artmethod_maps) {
            var artmethodobj = artmethod_maps[artmethodptr];
            try {
                dumpcodeitem(artmethodobj);
            } catch (e) {
                fKLog.kLog("dumpall发生异常" + e);
            }

        }
        fKLog.kLog("end dump all CodeItem.......")
    } catch (e) {
        fKLog.kLog("dumpall发生异常" + e);
    }
}
var loadmap = {};
function dumpclass(className) {
    if (Java.available) {
        Java.perform(function () {
            Java.enumerateClassLoaders({
                onMatch: function (loader) {
                    try {

                        loadmap[className] = true
                        fKLog.kLog("start loadclass->" + className);
                        var loadclass = loader.loadClass(className);
                        fKLog.kLog("after loadclass->" + loadclass);

                    } catch (e) {
                        fKLog.kLog("dumpclass 发生异常" + e);
                    }

                },
                onComplete: function () {

                }
            });
            dumpall();
        });
    }
}
function dealwithClassLoader(classloaderobj) {
    if (Java.available) {
        Java.perform(function () {
            try {
                var dexfileclass = Java.use("dalvik.system.DexFile");
                var BaseDexClassLoaderclass = Java.use("dalvik.system.BaseDexClassLoader");
                var DexPathListclass = Java.use("dalvik.system.DexPathList");
                var basedexclassloaderobj = Java.cast(classloaderobj, BaseDexClassLoaderclass);
                var tmpobj = basedexclassloaderobj.pathList.value;
                var pathlistobj = Java.cast(tmpobj, DexPathListclass);
                var dexElementsobj = pathlistobj.dexElements.value;
                if (dexElementsobj == null) {
                    return;
                }
                for (var i in dexElementsobj) {
                    var element = dexElementsobj[i];
                    var dexfileobj = Java.cast(element.dexFile.value, dexfileclass);
                    const enumeratorClassNames = dexfileobj.entries();
                    while (enumeratorClassNames.hasMoreElements()) {
                        var className = enumeratorClassNames.nextElement().toString();

                        fKLog.kLog("start loadclass->" + className);
                        var loadclass = classloaderobj.loadClass(className);
                        fKLog.kLog("after loadclass->" + loadclass);
                    }
                }
            } catch (e) {
                fKLog.kLog("dealwithClassLoader发生异常" + e);
            }
        });
    }
}

var preload = PRELOAD;
function fart() {
    if (Java.available) {
        Java.perform(function () {
            if (preload) {
                //上面是利用被动调用进行函数粒度的dump，对app正常运行过程中自己加载的所有类函数进行dump
                Java.enumerateClassLoaders({
                    onMatch: function (loader) {
                        try {
                            fKLog.kLog("start dealwithclassloader:" + loader);
                            dealwithClassLoader(loader);
                        } catch (e) {
                            fKLog.kLog("fart 发生异常" + e);
                        }

                    },
                    onComplete: function () {

                    }
                });
            }
            dumpall();
            //上面为对当前ClassLoader中的所有类进行主动加载，从而完成ArtMethod中的CodeItem的dump
        });

    }
}
//setImmediate();
setInterval(() => {
    hookart();
    fKLog.kLog("开始保存DEX文件");
    fart();
}, 10 * 1000)