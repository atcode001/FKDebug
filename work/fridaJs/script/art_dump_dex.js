(function () {
    function save(dexIndex, bin) {
        var message = {};
        message["jsname"] = "dump_dex";
        message["dexIndex"] = dexIndex;
        message["msg"] = "save";
        send(message, bin);
    } 


    function mkdir(path) {
        var mkdirPtr = Module.getExportByName('libc.so', 'mkdir');
        var mkdir = new NativeFunction(mkdirPtr, 'int', ['pointer', 'int']);

        var opendirPtr = Module.getExportByName('libc.so', 'opendir');
        var opendir = new NativeFunction(opendirPtr, 'pointer', ['pointer']);

        var closedirPtr = Module.getExportByName('libc.so', 'closedir');
        var closedir = new NativeFunction(closedirPtr, 'int', ['pointer']);

        var cPath = Memory.allocUtf8String(path);
        var dir = opendir(cPath);
        if (dir != 0) {
            closedir(dir);
            return 0;
        }
        mkdir(cPath, 755);
        chmod(path);
    }

    function chmod(path) {
        var chmodPtr = Module.getExportByName('libc.so', 'chmod');
        var chmod = new NativeFunction(chmodPtr, 'int', ['pointer', 'int']);
        var cPath = Memory.allocUtf8String(path);
        chmod(cPath, 755);
    }

    function dump_dex() {
        var symbol_name_s = [
            "_ZN3art11ClassLinker11DefineClassEPNS_6ThreadEPKcjNS_6HandleINS_6mirror11ClassLoaderEEERKNS_7DexFileERKNS_3dex8ClassDefE",
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
                //这个DefineClass的函数签名是Android9的
                //_ZN3art11ClassLinker11DefineClassEPNS_6ThreadEPKcmNS_6HandleINS_6mirror11ClassLoaderEEERKNS_7DexFileERKNS9_8ClassDefE

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

        var dex_maps = {};
        var dex_count = 1;

        if (addr_DefineClass) {
            Interceptor.attach(addr_DefineClass, {
                onEnter: function (args) {
                    var dex_file = args[5];
                    //ptr(dex_file).add(Process.pointerSize) is "const uint8_t* const begin_;"
                    //ptr(dex_file).add(Process.pointerSize + Process.pointerSize) is "const size_t size_;"
                    var base = ptr(dex_file).add(Process.pointerSize).readPointer();
                    var size = ptr(dex_file).add(Process.pointerSize + Process.pointerSize).readUInt();

                    if (dex_maps[base] != undefined) {
                        return;
                    }

                    var magic = ptr(base).readCString();
                    if (magic.indexOf("dex") != 0) {
                        return
                    }

                    dex_maps[base] = size;
                    var process_name = get_self_process_name();
                    if (process_name != "-1") {
                        var dex_buffer = ptr(base).readByteArray(size);
                        save(dex_count++, dex_buffer);
                    }
                },
                onLeave: function (retval) { }
            });
        }
    }

    function main() {
        fKLog.kLog("dump_dex.js init hook success")
        dump_dex();
    }

    setImmediate(main);
})();
