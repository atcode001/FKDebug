
function LibcNative() {
    var libname = "libc" + ".so";
    this.memcpyPtr = Process.getModuleByName(libname).findExportByName( 'memcpy');//void *memcpy(void *destin, void *source, unsigned n)；
    this.memcpy = new NativeFunction(this.memcpyPtr, 'void', ['pointer', 'pointer', 'int']);

    this.memsetPtr = Process.getModuleByName(libname).findExportByName( 'memset');//void *memcpy(void *destin, void *source, unsigned n)；
    this.memset = new NativeFunction(this.memsetPtr, 'void', ['pointer', 'int', 'int']);

    this.__memcpy_chkPtr = Process.getModuleByName(libname).findExportByName( '__memcpy_chk');//void *memcpy(void *destin, void *source, unsigned n)；
    this.__memcpy_chk = new NativeFunction(this.__memcpy_chkPtr, 'void', ['pointer', 'int', 'int']);

    this.openPtr = Process.getModuleByName(libname).findExportByName( 'open');
    this.open = new NativeFunction(this.openPtr, 'int', ['pointer', 'int']);
    this.readPtr = Process.getModuleByName(libname).findExportByName( "read");
    this.read = new NativeFunction(this.readPtr, "int", ["int", "pointer", "int"]);

    this.writePtr = Process.getModuleByName("libc.so").findExportByName( "write");
    this.write = new NativeFunction(this.writePtr, 'int', ['int', 'pointer', 'int']);

    this.closePtr = Process.getModuleByName(libname).findExportByName( 'close');
    this.close = new NativeFunction(this.closePtr, 'int', ['int']);
    this.mallocPtr = Process.getModuleByName(libname).findExportByName( 'malloc');
    this.malloc = new NativeFunction(this.mallocPtr, 'pointer', ['int']);
    this.freePtr = Process.getModuleByName(libname).findExportByName( 'free');

    this.fopenPtr = Process.getModuleByName(libname).findExportByName( 'fopen');
    this.fopen = new NativeFunction(this.fopenPtr, 'pointer', ['pointer', 'pointer']);

    this.openatPtr = Process.getModuleByName(libname).findExportByName( 'openat');
    this.openat = new NativeFunction(this.openatPtr, 'int', ['int', 'pointer', 'int', 'int']);

    this.fgetsPtr = Process.getModuleByName(libname).findExportByName( "fgets");
    this.fgets = new NativeFunction(this.fgetsPtr, 'pointer', ['pointer', 'int', 'pointer']);
    this.freadPtr = Process.getModuleByName(libname).findExportByName( "fread");
    this.fread = new NativeFunction(this.freadPtr, "int", ["pointer", "int", "int", "pointer"]);
    this.fclosePtr = Process.getModuleByName(libname).findExportByName( 'fclose');
    this.fclose = new NativeFunction(this.fclosePtr, 'int', ['pointer']);

    this.sleepPtr = Process.getModuleByName(libname).findExportByName( 'sleep');
    this.sleep = new NativeFunction(this.sleepPtr, "void", ["int"]);
    this.nanosleepPtr = Process.getModuleByName(libname).findExportByName( 'nanosleep');

    this.strstrPtr = Process.getModuleByName(libname).findExportByName( 'strstr');
    this._strchr_chkPtr = Process.getModuleByName(libname).findExportByName( '__strchr_chk');
    this.strcasestrPtr = Process.getModuleByName(libname).findExportByName( 'strcasestr');

    this.strlenPtr = Process.getModuleByName(libname).findExportByName( 'strlen');
    this.strlen = new NativeFunction(this.strlenPtr, 'int', ['pointer']);

    this.strcmpPtr = Process.getModuleByName(libname).findExportByName( 'strcmp');
    this.strcasecmpPtr = Process.getModuleByName(libname).findExportByName( 'strcasecmp');
    this.strncmpPtr = Process.getModuleByName(libname).findExportByName( 'strncmp');
    this.strcpyPtr = Process.getModuleByName(libname).findExportByName( 'strcpy');//char* strcpy(char* destination ,constchar* source)

    this.strcpy = new NativeFunction(this.strcpyPtr, 'pointer', ['pointer', 'pointer']);
    this.strncpyPtr = Process.getModuleByName(libname).findExportByName( 'strncpy');//char* strncpy(char* destination ,constchar* source)

    this.clock_gettimePtr = Process.getModuleByName(libname).findExportByName( 'clock_gettime');
    this.sendPtr = Process.getModuleByName(libname).findExportByName( 'send');
    this.sendtoPtr = Process.getModuleByName(libname).findExportByName( 'sendto');
    this.recvPtr = Process.getModuleByName(libname).findExportByName( 'recv');
    this.recvfromPtr = Process.getModuleByName(libname).findExportByName( 'recvfrom');

    this.exitPtr = Process.getModuleByName(libname).findExportByName( 'exit');
    this.exit = new NativeFunction(this.exitPtr, 'void', ['int']);

    this._ExitPtr = Process.getModuleByName(libname).findExportByName( '_Exit');
    this._exitPtr = Process.getModuleByName(libname).findExportByName( '_exit');
    this.quick_exitPtr = Process.getModuleByName(libname).findExportByName( 'quick_exit');
    this.__cxa_atexitPtr = Process.getModuleByName(libname).findExportByName( '__cxa_atexit');
    this.abortPtr = Process.getModuleByName(libname).findExportByName( 'abort');
    this.sprintfPtr = Process.getModuleByName(libname).findExportByName( 'sprintf');
    this.snprintfPtr = Process.getModuleByName(libname).findExportByName( 'snprintf');
    this.opendirPtr = Process.getModuleByName(libname).findExportByName( 'opendir');
    this.faccessatPtr = Process.getModuleByName(libname).findExportByName( 'faccessat');
    this.fstatatPtr = Process.getModuleByName(libname).findExportByName( 'fstatat');
    this.statPtr = Process.getModuleByName(libname).findExportByName( 'stat');
    this.statfsPtr = Process.getModuleByName(libname).findExportByName( 'statfs');
    this.unamePtr = Process.getModuleByName(libname).findExportByName( 'uname');
    this.syscallPtr = Process.getModuleByName(libname).findExportByName( 'syscall');
    this.ptracePtr = Process.getModuleByName(libname).findExportByName( 'ptrace');
    this.getppidPtr = Process.getModuleByName(libname).findExportByName( 'getppid');
    this.getpidPtr = Process.getModuleByName(libname).findExportByName( 'getpid');
    this.getuidPtr = Process.getModuleByName(libname).findExportByName( 'getuid');
    this.getpid = new NativeFunction(this.getpidPtr, 'int', []);
    this.getppid = new NativeFunction(this.getppidPtr, 'int', []);
    this.getuid = new NativeFunction(this.getuidPtr, 'int', []);

    this.__system_property_findPtr = Process.getModuleByName(libname).findExportByName( '__system_property_find');
    this.__system_property_getPtr = Process.getModuleByName(libname).findExportByName( '__system_property_get');
    this.__system_property_readPtr = Process.getModuleByName(libname).findExportByName( '__system_property_read');
    this.__system_property_read = new NativeFunction(this.__system_property_readPtr, "int", ["pointer", "pointer", "pointer"]);
    this.__system_property_find = new NativeFunction(this.__system_property_findPtr, "pointer", ["pointer"]);
    this.__system_property_get = new NativeFunction(this.__system_property_getPtr, "int", ["pointer", "pointer"]);

}
var libcNative = new LibcNative();
//LibcNative End