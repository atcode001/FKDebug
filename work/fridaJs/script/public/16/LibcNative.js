
function LibcNative() {
    var libname = "libc" + ".so";
    this.memcpyPtr = Module.getExportByName(libname, 'memcpy');//void *memcpy(void *destin, void *source, unsigned n)；
    this.memcpy = new NativeFunction(this.memcpyPtr, 'void', ['pointer', 'pointer', 'int']);

    this.memsetPtr = Module.getExportByName(libname, 'memset');//void *memcpy(void *destin, void *source, unsigned n)；
    this.memset = new NativeFunction(this.memsetPtr, 'void', ['pointer', 'int', 'int']);

    this.__memcpy_chkPtr = Module.getExportByName(libname, '__memcpy_chk');//void *memcpy(void *destin, void *source, unsigned n)；
    this.__memcpy_chk = new NativeFunction(this.__memcpy_chkPtr, 'void', ['pointer', 'int', 'int']);

    this.openPtr = Module.getExportByName(libname, 'open');
    this.open = new NativeFunction(this.openPtr, 'int', ['pointer', 'int']);
    this.readPtr = Module.getExportByName(libname, "read");
    this.read = new NativeFunction(this.readPtr, "int", ["int", "pointer", "int"]);

    this.writePtr = Module.getExportByName("libc.so", "write");
    this.write = new NativeFunction(this.writePtr, 'int', ['int', 'pointer', 'int']);

    this.closePtr = Module.getExportByName(libname, 'close');
    this.close = new NativeFunction(this.closePtr, 'int', ['int']);
    this.mallocPtr = Module.getExportByName(libname, 'malloc');
    this.malloc = new NativeFunction(this.mallocPtr, 'pointer', ['int']);
    this.freePtr = Module.getExportByName(libname, 'free');

    this.fopenPtr = Module.getExportByName(libname, 'fopen');
    this.fopen = new NativeFunction(this.fopenPtr, 'pointer', ['pointer', 'pointer']);

    this.openatPtr = Module.getExportByName(libname, 'openat');
    this.openat = new NativeFunction(this.openatPtr, 'int', ['int', 'pointer', 'int', 'int']);

    this.fgetsPtr = Module.findExportByName(libname, "fgets");
    this.fgets = new NativeFunction(this.fgetsPtr, 'pointer', ['pointer', 'int', 'pointer']);
    this.freadPtr = Module.getExportByName(libname, "fread");
    this.fread = new NativeFunction(this.freadPtr, "int", ["pointer", "int", "int", "pointer"]);
    this.fclosePtr = Module.getExportByName(libname, 'fclose');
    this.fclose = new NativeFunction(this.fclosePtr, 'int', ['pointer']);

    this.sleepPtr = Module.getExportByName(libname, 'sleep');
    this.sleep = new NativeFunction(this.sleepPtr, "void", ["int"]);
    this.nanosleepPtr = Module.getExportByName(libname, 'nanosleep');

    this.strstrPtr = Module.getExportByName(libname, 'strstr');
    this._strchr_chkPtr = Module.getExportByName(libname, '__strchr_chk');
    this.strcasestrPtr = Module.getExportByName(libname, 'strcasestr');

    this.strlenPtr = Module.getExportByName(libname, 'strlen');
    this.strlen = new NativeFunction(this.strlenPtr, 'int', ['pointer']);

    this.strcmpPtr = Module.getExportByName(libname, 'strcmp');
    this.strcasecmpPtr = Module.getExportByName(libname, 'strcasecmp');
    this.strncmpPtr = Module.getExportByName(libname, 'strncmp');
    this.strcpyPtr = Module.getExportByName(libname, 'strcpy');//char* strcpy(char* destination ,constchar* source)

    this.strcpy = new NativeFunction(this.strcpyPtr, 'pointer', ['pointer', 'pointer']);
    this.strncpyPtr = Module.getExportByName(libname, 'strncpy');//char* strncpy(char* destination ,constchar* source)

    this.clock_gettimePtr = Module.getExportByName(libname, 'clock_gettime');
    this.sendPtr = Module.getExportByName(libname, 'send');
    this.sendtoPtr = Module.getExportByName(libname, 'sendto');
    this.recvPtr = Module.getExportByName(libname, 'recv');
    this.recvfromPtr = Module.getExportByName(libname, 'recvfrom');

    this.exitPtr = Module.getExportByName(libname, 'exit');
    this.exit = new NativeFunction(this.exitPtr, 'void', ['int']);

    this._ExitPtr = Module.getExportByName(libname, '_Exit');
    this._exitPtr = Module.getExportByName(libname, '_exit');
    this.quick_exitPtr = Module.getExportByName(libname, 'quick_exit');
    this.__cxa_atexitPtr = Module.getExportByName(libname, '__cxa_atexit');
    this.abortPtr = Module.getExportByName(libname, 'abort');
    this.sprintfPtr = Module.getExportByName(libname, 'sprintf');
    this.snprintfPtr = Module.getExportByName(libname, 'snprintf');
    this.opendirPtr = Module.getExportByName(libname, 'opendir');
    this.faccessatPtr = Module.getExportByName(libname, 'faccessat');
    this.fstatatPtr = Module.getExportByName(libname, 'fstatat');
    this.statPtr = Module.getExportByName(libname, 'stat');
    this.statfsPtr = Module.getExportByName(libname, 'statfs');
    this.unamePtr = Module.getExportByName(libname, 'uname');
    this.syscallPtr = Module.getExportByName(libname, 'syscall');
    this.ptracePtr = Module.getExportByName(libname, 'ptrace');
    this.getppidPtr = Module.getExportByName(libname, 'getppid');
    this.getpidPtr = Module.getExportByName(libname, 'getpid');
    this.getuidPtr = Module.getExportByName(libname, 'getuid');
    this.getpid = new NativeFunction(this.getpidPtr, 'int', []);
    this.getppid = new NativeFunction(this.getppidPtr, 'int', []);
    this.getuid = new NativeFunction(this.getuidPtr, 'int', []);

    this.__system_property_findPtr = Module.getExportByName(libname, '__system_property_find');
    this.__system_property_getPtr = Module.getExportByName(libname, '__system_property_get');
    this.__system_property_readPtr = Module.getExportByName(libname, '__system_property_read');
    this.__system_property_read = new NativeFunction(this.__system_property_readPtr, "int", ["pointer", "pointer", "pointer"]);
    this.__system_property_find = new NativeFunction(this.__system_property_findPtr, "pointer", ["pointer"]);
    this.__system_property_get = new NativeFunction(this.__system_property_getPtr, "int", ["pointer", "pointer"]);

}
var libcNative = new LibcNative();
//LibcNative End