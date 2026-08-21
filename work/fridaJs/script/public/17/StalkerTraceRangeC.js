
/**
* Trace跟踪
* @param {any} libname
* @param {any} traceOffset
* @param {any} traceRang
* @param {any} tracesymbol
* @param {any} beginEvent
* @param {any} endEvnet
*/
function StalkerTraceRangeC(libname, traceOffset, traceRang, exportsLibs, addr_names, beginEvent, endEvnet, moduleBase, svccb, jnicb) {

    var code = `
#include <gum/gumstalker.h> 
#include <stdio.h>
#include <string.h>
#include <stdlib.h> 

extern void on_bl_enter_message(guint ctxPos,GumCpuContext *message,gpointer addr);
extern void on_bl_leave_message(guint ctxPos,GumCpuContext *message,gpointer addr);
extern void on_message(gint type,const gchar *message);

static void log(gint type,const gchar *format, ...);
static void on_blctx_leave(GumCpuContext *cpu_context, gpointer user_data);
static void on_ctx_before(GumCpuContext *cpu_context, gpointer user_data);
static void on_blctx_before(GumCpuContext *cpu_context, gpointer user_data);

#define DataCacheBuffsize 1024*1024
struct DataCache
{
    gint blRetCount;
    guint64 blReturnAddrs[1024];
    guint64 preUserData;
    GumCpuContext  preCtxData;
    guint CtxPos;
    gint CtxDataPos;
    gint CtxDataCacheCount;
    gchar buff[DataCacheBuffsize];
};
extern struct DataCache CtxDataCache; 
extern gint SigleLogCtxPos;
extern guint64 ExcludeAddress[];
void hello() {
    on_message(3,"Hello form CModule");
}  
int GetDataCacheCount(){
    return  CtxDataCache.CtxDataCacheCount;
}
int  SendDataCache(){
     guint64 * preCtxData =(guint64 *)&CtxDataCache.preCtxData;
     gint ctxDataCacheCount=CtxDataCache.CtxDataCacheCount;
     on_message(0,(gchar *)&CtxDataCache.CtxDataCacheCount);  
     CtxDataCache.preUserData=0;
     memset(preCtxData,0,sizeof(GumCpuContext));
     CtxDataCache.CtxDataPos=0;
     CtxDataCache.CtxDataCacheCount=0;
     memset(CtxDataCache.buff,0,DataCacheBuffsize);
    return ctxDataCacheCount;
}
gpointer GetDataCache(){
    return  (gpointer)&CtxDataCache.CtxDataCacheCount;
}
gpointer GetLastDataCtx(){
    return  (gpointer)&CtxDataCache.preCtxData;
} 
static void log(gint type,const gchar *format, ...)
{
    va_list args; 
    gchar *  message;
    va_start(args, format);
    message = g_strdup_vprintf(format, args);
    va_end(args);
    on_message(type,message); 
    g_free(message);
}
const gchar * insn_format="{\\"id\\":%d,\\"block\\":\\"0x%llx\\",\\"addr\\":\\"0x%llx\\",\\"insn\\":\\"%s\\",\\"op\\":\\"%s\\"}";//0x%016llx
void transform(GumStalkerIterator *iterator,GumStalkerOutput *output,gpointer user_data)
{
    cs_insn *insn; 
    gpointer* puser_data= (gpointer*)user_data;
    gboolean track = *(gboolean *)user_data;
    gint count =*(gint *)(user_data+4);
     
    gpointer startAddress = NULL;   
    gboolean in_target =!track;
    gint excludeCount=*(gint *)(ExcludeAddress);    

    while (gum_stalker_iterator_next(iterator, &insn))
    {
        if(startAddress == NULL)
        {  
            startAddress = (gpointer)insn->address;   
            for(gint i=0;i<count;i++){            
                gpointer base =puser_data[1+i*2];
                gpointer end = puser_data[2+i*2]; 
                if(startAddress >= base && startAddress < end)
                { 
                    in_target=track;
                    break;
                }
            }
           
        }
        for(gint j=0;j<excludeCount;j++){
            guint64 base =ExcludeAddress[1+j*2];
            guint64 end = ExcludeAddress[2+j*2];
            if(insn->address >= base && insn->address < end)
            {
                log(5,"ExcludeAddress %016llx,%d",insn->address,CtxDataCache.CtxPos);
                in_target=false;
                break;
            }
        }
        if(in_target)
        {
            gboolean isReturnAddr=false;
            for(gint i=CtxDataCache.blRetCount-1;i>0;i--)
            {
                if(CtxDataCache.blReturnAddrs[i]==insn->address)
                {      
                    isReturnAddr=true;
                    CtxDataCache.blRetCount=i;
                    break;
                }
            }
            if(isReturnAddr)
            {
                guint64 * cc= (guint64 *)g_malloc(sizeof(guint64)*2);
                cc[0]=(guint64)startAddress;
                cc[1]=insn->address-4;
                gum_stalker_iterator_put_callout(iterator, on_blctx_leave,cc, NULL);                   
                log(1,insn_format,insn->id,startAddress, (gpointer)insn->address, insn->mnemonic, insn->op_str);
            }else  if(insn->id==ARM64_INS_BL || insn->id==ARM64_INS_BLR || insn->id==ARM64_INS_SVC){
                guint64 * cc= g_malloc(sizeof(guint64)*2);
                cc[0]=(guint64)startAddress;
                cc[1]=insn->address;
                gum_stalker_iterator_put_callout(iterator, on_blctx_before,cc, NULL);                    
                CtxDataCache.blReturnAddrs[CtxDataCache.blRetCount]=insn->address+4;
                CtxDataCache.blRetCount++;
                log(2,insn_format,insn->id,startAddress, (gpointer)insn->address, insn->mnemonic, insn->op_str);
            }else{
                gum_stalker_iterator_put_callout(iterator, on_ctx_before,startAddress, NULL);                
                log(1,insn_format,insn->id,startAddress, (gpointer)insn->address, insn->mnemonic, insn->op_str);
            }
        }
        gum_stalker_iterator_keep(iterator);
    }
}
static void on_blctx_leave(GumCpuContext *ctx, gpointer user_data)
{
     gpointer * p=(gpointer *)user_data;
     on_bl_leave_message(CtxDataCache.CtxPos,ctx,p[1]);
     on_ctx_before(ctx, p[0]);
}
static void on_blctx_before(GumCpuContext *ctx, gpointer user_data)
{
     gpointer * p=(gpointer *)user_data;
     on_bl_enter_message(CtxDataCache.CtxPos,ctx,p[1]);
     on_ctx_before(ctx, p[0]);
}
static void on_ctx_before(GumCpuContext *ctx, gpointer user_data)
{ 
    guint64 * preCtxData =(guint64 *)&CtxDataCache.preCtxData;
    gchar * pCount = &CtxDataCache.buff[CtxDataCache.CtxDataPos];
    gchar * gHeader=pCount+1; 
    gchar count=0;
    guint maxcount=sizeof(GumCpuContext) / sizeof(guint64); 
    guint64 *  pCtxData=NULL;
    guint64 * curCtxData = (guint64 *)ctx;
    if((guint64)user_data != CtxDataCache.preUserData)
    {
        gHeader[0] = 0;
        count++;
        CtxDataCache.preUserData=(guint64)user_data;
    }
    for(int i=0;i<maxcount;i++)
    {
        if(preCtxData[i] != curCtxData[i])
        {
            gHeader[count]=i+1;
            preCtxData[i]=curCtxData[i]; 
            count++;
        }
    }
    *pCount = count;
    pCtxData =(guint64 *)&gHeader[count];
    for(int i=0;i<count;i++)
    {
        gchar index=gHeader[i];
        if(i==0 && index==0)
        {
            pCtxData[i]=(guint64)user_data; 
        }else{            
            pCtxData[i]=curCtxData[index-1];
        }
    }

    CtxDataCache.CtxDataPos+=1+count+count*sizeof(guint64);
    CtxDataCache.CtxDataCacheCount++; 
    CtxDataCache.CtxPos++;
    
    if(DataCacheBuffsize - CtxDataCache.CtxDataPos < sizeof(GumCpuContext) || (CtxDataCache.CtxPos>SigleLogCtxPos ))//&&  CtxDataCache.CtxPos%100==0
    {  
        //log(4,"%016llx,%d,%016llx",ctx->pc,CtxDataCache.CtxPos,ctx->x[8]);
        on_message(0,(gchar *)&CtxDataCache.CtxDataCacheCount);  
        CtxDataCache.preUserData=0;
        memset(preCtxData,0,sizeof(GumCpuContext));
        CtxDataCache.CtxDataPos=0;
        CtxDataCache.CtxDataCacheCount=0;
        memset(CtxDataCache.buff,0,DataCacheBuffsize);
    }
}
 
`;

    this.addr_name = [];
    function getXRegister(ctx, x) {
        if (x == "pc")
            x = 0;
        else if (x == "sp")
            x = 1;
        else if (x == "nzcv")
            x = 2;
        else if (x == "fp")
            x = 32;
        else if (x == "lr")
            x = 33;
        else
            x = x + 3;
        return ctx.add(x * 8).readPointer();
    }
    function WriteRegister(ctx, x, v) {
        if (x == "pc")
            x = 0;
        else if (x == "sp")
            x = 1;
        else if (x == "nzcv")
            x = 2;
        else if (x == "fp")
            x = 32;
        else if (x == "lr")
            x = 33;
        else
            x = x + 3;
        return ctx.add(x * 8).writePointer(v);
    }
    function getCtx(ctx) {
        var result = {};
        result["pc"] = getXRegister(ctx, "pc");
        result["sp"] = getXRegister(ctx, "sp");
        result["cpsr"] = getXRegister(ctx, "cpsr");
        for (var i = 0; i <= 28; i++) {
            result["x" + i] = getXRegister(ctx, i);
        }
        result["fp"] = getXRegister(ctx, "fp");
        result["lr"] = getXRegister(ctx, "lr");
        return result;
    }
    var fileFdmap = {};
    function SavePtrToFileLibc(ptrAddr, len, path) {
        if (!ptrAddr || !len || len <= 0 || !path)
            return -1;

        var fileFd = fileFdmap[path]
        if (fileFd == null) {
            // constants (可按需调整)
            var AT_FDCWD = -100;            // dirfd
            var O_WRONLY = 1;              // from fcntl.h
            var O_CREAT = 0x40;            // 64
            var O_APPEND = 0x400;          // 1024 on many Android, 若平台不同请调整
            var flags = O_WRONLY | O_CREAT | O_APPEND;
            var mode = 0o644; // 文件权限

            var cpath = Memory.allocUtf8String(path);
            // open file (使用 openat 包装以便传入 mode)
            var fd = libcNative.openat(AT_FDCWD, cpath, flags, mode);
            if (fd <= 0) {
                // some libc openat 返回负数表示错误
                return fd;
            }
            fileFd = fd;
            fileFdmap[path] = fd;
        }

        return libcNative.write(fileFd, ptrAddr, len);
    }
    this.SigleLogCtxPosPtr = Memory.alloc(4);
    this.ExcludeAddressPtr = Memory.alloc(10240);
    this.ExcludeAddressPtr.writePointer(ptr(0));
    this.SigleLogCtxPosPtr.writeInt(0x7FFFFFFF);
    this.openSigleLog = false;//单步日志
    this.jniLogger = new JNILogger();
    this.svclogger = new SVCLogger(svccb);
    this.monitorJni_cb = jnicb;
    this.pc_cache = {};
    this.randomNumber = 0xded00000;
    this.arm64CM = new CModule(code, {
        CtxDataCache: Memory.alloc(2 * 1024 * 1024),
        SigleLogCtxPos: this.SigleLogCtxPosPtr,
        ExcludeAddress: this.ExcludeAddressPtr,
        on_bl_enter_message: new NativeCallback((ctxpos, p_ctx, addr) => {
            var ins = this.ins_addr[addr];
            var blAddr = null;
            var addrInfo = null;
            if (ins.insn == "bl") {
                blAddr = ptr(ins.op.substr(1, ins.op.length - 1));
                addrInfo = this.addr_name[blAddr];
            } else if (ins.insn == "blr") {
                var op = parseInt(ins.op.substr(1, ins.op.length - 1));
                blAddr = getXRegister(p_ctx, op);
                addrInfo = this.addr_name[blAddr];
            } else if (ins.insn == "svc") {
                if (this.addr_returnStack[addr] == null)
                    this.addr_returnStack[addr] = [];
                var ctx = getCtx(p_ctx);
                this.svclogger.svcEnter(ctx, ctx.pc);
                this.addr_returnStack[addr].push({ enterctx: ctx, moduleName: "svc", name: "svc" });
                return;
            } else {
                console.log({ type: "unknow bl", ctxpos: ctxpos, ctx: ctx, addr: addr, ins: ins })
                return;
            }

            if (addrInfo == null) {
                if (this.addr_returnStack[addr] != null)
                    this.addr_returnStack[addr].push({});
                //var pc = getXRegister(p_ctx, "pc");
                //var sym = this.pc_cache[pc];
                //if (sym == null) {
                //    this.pc_cache[pc] = DebugSymbol.fromAddress(pc)
                //}
                //console.log({ type: "bl_enter", ctxpos: ctxpos, blAddr: blAddr, sym })
                return;
            }
            if (addrInfo.callback != null) {
                if (this.addr_returnStack[addr] == null)
                    this.addr_returnStack[addr] = [];

                var ctx = getCtx(p_ctx);
                var stack = {
                    enterctx: ctx, name: addrInfo.name, pos: ctxpos, callback: addrInfo.callback, log: { name: addrInfo.name }
                }

                addrInfo.callback(stack.log, ctx, null);
                this.addr_returnStack[addr].push(stack);
                return;
            }
            if (addrInfo.moduleName == "libart.so") {
                if (this.addr_returnStack[addr] == null)
                    this.addr_returnStack[addr] = [];

                var ctx = getCtx(p_ctx);
                this.jniLogger.Enter(addrInfo.name, ctx);
                this.addr_returnStack[addr].push({ enterctx: ctx, name: addrInfo.name, pos: ctxpos, moduleName: addrInfo.moduleName });
            } else {

                switch (addrInfo.name) {
                    default:
                        {
                            if (addrInfo.callback != null) {

                            } else {
                                console.log({ type: "bl_enter", ctxpos: ctxpos, blAddr: blAddr, symbol: addrInfo, addr: addr, ins: ins })
                            }
                        }
                    case "pthread_mutex_lock":
                    case "pthread_mutex_unlock":
                        if (this.addr_returnStack[addr] != null)
                            this.addr_returnStack[addr].push({});
                        return;
                    case "memmove":
                        {
                            if (this.addr_returnStack[addr] == null)
                                this.addr_returnStack[addr] = [];

                            var ctx = getCtx(p_ctx);
                            var readSize = 0x500;
                            if (ctx.x2 < 0x500)
                                readSize = ctx.x2 - 0;

                            this.addr_returnStack[addr].push({
                                enterctx: ctx, name: addrInfo.name, pos: ctxpos, moduleName: addrInfo.moduleName,
                                srcData: [{ name: "x1", value: readHex(ctx.x1, readSize), addr: ctx.x1, size: ctx.x2 }],
                            });
                        }
                        break;
                    case "memchr_default":
                    case "memchr":
                    case "__system_property_read":
                    case "gettimeofday":
                    case "dladdr":
                    case "malloc":
                    case "time":
                    case "arc4random":
                    case "lrand48":
                    case "arc4random_buf":
                    case "sprintf":
                    case "snprintf":
                    case "memcpy":
                    case "memcpy2":
                    case "__system_property_find":
                    case "free":
                    case "atoi":
                    case "strdup":
                    case "dlsym":
                    case "access":
                    case "fopen":
                    case "strncpy":
                    case "strcpy":
                    case "strstr":
                    case "strcmp":
                    case "mkdir":
                    case "realloc":
                    case "getpid":
                    case "syscall":
                    case "strcasestr":
                    case "strlen_default":
                    case "strlen":
                    case "strtok_r":
                    case "calloc":
                    case "random":
                    case "memset":
                    case "strncmp":
                    case "stat":
                    case "srandom":
                    case "strftime":
                    case "localtime":
                    case "tolower":
                    case "srand48":
                    case "pow":
                    case "__memcpy_chk":
                    case "__memset_chk":
                        {
                            if (this.addr_returnStack[addr] == null)
                                this.addr_returnStack[addr] = [];

                            var ctx = getCtx(p_ctx);
                            this.addr_returnStack[addr].push({ enterctx: ctx, name: addrInfo.name, pos: ctxpos, moduleName: addrInfo.moduleName });
                        }
                        break;
                }
            }

        }, "void", ['uint', 'pointer', 'pointer']),
        on_bl_leave_message: new NativeCallback((ctxpos, p_ctx, addr) => {
            var stacks = this.addr_returnStack[addr];
            if (stacks == null)
                return;

            var len = stacks.length;
            if (len == 0)
                return;

            var stack = stacks[len - 1];
            stacks.pop();

            if (stack.enterctx == null)
                return;

            var log = null;
            var enterctx = stack.enterctx;
            var leavectx = getCtx(p_ctx);
            var name = stack.name;

            if (stack.callback == null) {
                if (stack.moduleName == "libart.so") {
                    log = {}
                    log = this.jniLogger.Leave(name, leavectx, leavectx.x0);
                    if (this.monitorJni_cb != null) {
                        this.monitorJni_cb(log)
                        if (log.ret_val) {
                            WriteRegister(p_ctx, 0, ptr(log.ret_val))
                        }
                    }
                } else if (stack.moduleName == "svc") {
                    log = {};
                    log = this.svclogger.svcLeave(leavectx, leavectx.pc);
                } else {
                    switch (name) {
                        case "arc4random":
                            {
                                WriteRegister(p_ctx, 0, ptr(this.randomNumber))
                                this.randomNumber++;
                                break;
                            }
                        case "arc4random_buf":
                            {
                                log = {
                                    name: name,
                                    distData: [{ name: "x0", value: readHex(enterctx.x0, enterctx.x1), addr: enterctx.x0, size: enterctx.x1 }, { name: "x1", value: enterctx.x1 }]
                                }
                                break;
                            }
                        case "__system_property_read":
                            {
                                var str = enterctx.x2.readCString();
                                log = {
                                    name: name,
                                    distStr: [{ name: "x2", addr: enterctx.x2, value: enterctx.x2.readCString() }],
                                    srcData: [{ name: "x0", value: enterctx.x0, size: str.length }],
                                    distData: [{ name: "x2", addr: enterctx.x2, value: readHex(enterctx.x2, str.length), size: str.length }]
                                }
                                break;
                            }
                        case "clock_gettime":
                            {
                                log = {
                                    name: name,
                                    distData: [{ name: "x1", value: readHex(enterctx.x1, Process.pointerSize * 2), addr: enterctx.x1, size: Process.pointerSize * 2 }]
                                }
                                break;
                            }
                        case "gettimeofday":
                            {
                                log = {
                                    name: name,
                                    distData: [{ name: "x0", value: readHex(enterctx.x0, Process.pointerSize * 2), addr: enterctx.x0, size: Process.pointerSize * 2 }]
                                }
                                break;
                            }
                        case "dladdr":
                            {
                                log = {
                                    name: name,
                                    srcData: [{ name: "x0", value: enterctx.x0 }],
                                    distData: [{ name: "x1", value: readHex(enterctx.x1, Process.pointerSize * 4), addr: enterctx.x1, size: Process.pointerSize * 4 }],
                                    addressInfo: DebugSymbol.fromAddress(enterctx.x0)
                                }
                                break;
                            }
                        case "pow":
                            {
                                log = {
                                    name: name,
                                    srcData: [{ name: "x0", value: enterctx.x0 }, { name: "x1", value: enterctx.x1 }],
                                }
                                break;
                            }
                        case "srandom":
                        case "syscall":
                        case "malloc":
                        case "localtime":
                        case "tolower":
                        case "srand48":
                            {
                                log = {
                                    name: name,
                                    srcData: [{ name: "x0", value: enterctx.x0 }],
                                }
                                break;
                            }
                        case "snprintf":
                            {
                                log = {
                                    name: name,
                                    distStr: [{ name: "x0", value: enterctx.x0.readCString(), addr: enterctx.x0 }],
                                    distData: [{ name: "x0", value: readHex(enterctx.x0, leavectx.x0 - 0), addr: enterctx.x0, size: leavectx.x0 }],
                                    constSrc: [{ name: "x1", value: enterctx.x1 }, { name: "x2", value: enterctx.x2.readCString() }],
                                }
                                break;
                            }
                        case "sprintf":
                            {
                                log = {
                                    name: name,
                                    distStr: [{ name: "x0", value: enterctx.x0.readCString(), addr: enterctx.x0 }],
                                    distData: [{ name: "x0", value: readHex(enterctx.x0, leavectx.x0 - 0), addr: enterctx.x0, size: leavectx.x0 }],
                                    constSrc: [{ name: "x1", value: enterctx.x1.readCString() }],
                                }
                                break;
                            }
                        case "__memcpy_chk": {
                            var readSize = 0x1000;
                            if (enterctx.x2 < 0x1000) {
                                readSize = enterctx.x2 - 0;
                            }
                            log = {
                                name: name,
                                distStr: [{ name: "x0", value: enterctx.x0.readCString(readSize), addr: enterctx.x0 }],
                                distData: [{ name: "x0", value: readHex(enterctx.x0, readSize), addr: enterctx.x0, size: enterctx.x2 }],
                                srcData: [{ name: "x1", value: readHex(enterctx.x1, readSize), addr: enterctx.x1, size: enterctx.x2 }],
                                readsize: readSize
                            };
                            break;
                        }

                        case "memmove":
                            {
                                var readSize = 0x1000;
                                if (enterctx.x2 < 0x1000) {
                                    readSize = enterctx.x2 - 0;
                                }
                                log = {
                                    name: name,
                                    distStr: [{ name: "x0", value: enterctx.x0.readCString(readSize), addr: enterctx.x0 }],
                                    distData: [{ name: "x0", value: readHex(enterctx.x0, readSize), addr: enterctx.x0, size: enterctx.x2 }],
                                    srcData: stack.srcData,
                                    readsize: readSize
                                };
                                break;
                            }
                        case "memcpy2":
                        case "strncpy":
                        case "memcpy":
                        case "strncmp":
                            {
                                log = {
                                    name: name,
                                    distStr: [{ name: "x0", value: enterctx.x0.readCString(readSize), addr: enterctx.x0 }],
                                    distData: [{ name: "x0", value: readHex(enterctx.x0, readSize), addr: enterctx.x0, size: enterctx.x2 }],
                                    srcData: [{ name: "x1", value: readHex(enterctx.x1, readSize), addr: enterctx.x1, size: enterctx.x2 }],
                                    readsize: readSize
                                };
                            }
                            break;
                        case "stat":
                        case "__system_property_find":
                        case "atoi":
                        case "strdup":
                        case "access":
                        case "fopen":
                        case "mkdir":
                        case "strlen_default":
                        case "strlen":
                            {
                                var str = enterctx.x0.readCString();
                                log = {
                                    name: name,
                                    srcStr: [{ name: "x0", value: str, addr: enterctx.x0 }],
                                    srcData: [{ name: "x0", value: readHex(enterctx.x0, str.length), addr: enterctx.x0, size: str.length }],
                                };
                            }
                            break;
                        case "strcpy":

                            var str = enterctx.x1.readCString();
                            log = {
                                name: name,
                                distStr: [{ name: "x0", value: str, addr: enterctx.x0 }],
                                distData: [{ name: "x0", value: readHex(enterctx.x0, str.length), addr: enterctx.x0, size: str.length }],
                                srcData: [{ name: "x1", value: readHex(enterctx.x1, str.length), addr: enterctx.x1, size: str.length }],
                            };

                            break;
                        case "strcmp":
                        case "strstr":
                        case "strcasestr":
                            {
                                var str = enterctx.x0.readCString();
                                var str1 = enterctx.x1.readCString();
                                log = {
                                    name: name,
                                    srcStr: [
                                        { name: "x0", value: str },
                                        { name: "x1", value: str1 }
                                    ],
                                    srcData: [
                                        { name: "x0", value: readHex(enterctx.x0, str.length - 0), addr: enterctx.x0, size: str.length },
                                        { name: "x1", value: readHex(enterctx.x1, str1.length - 0), addr: enterctx.x1, size: str1.length }
                                    ],
                                };
                                break;
                            }
                        case "memchr_default":
                        case "memchr": {
                            log = {
                                name: name,
                                srcStr: [{ name: "x0", value: enterctx.x0.readCString(parseInt(enterctx.x2)), addr: enterctx.x0, size: enterctx.x2 }, { name: "x1", value: enterctx.x1 }],
                                srcData: [{ name: "x0", value: readHex(enterctx.x0, enterctx.x2), addr: enterctx.x0, size: enterctx.x2 }, { name: "x1", value: enterctx.x1 }],
                            };
                            break
                        }
                        case "strtok_r":
                            {
                                var str = enterctx.x0.readCString();
                                var str1 = enterctx.x1.readCString();
                                if (str == null)
                                    str = "";
                                log = {
                                    name: name,
                                    srcStr: [{ name: "x0", value: str }],
                                    constSrc: [{ name: "x1", value: str1 }],
                                    srcData: [{ name: "x0", value: readHex(enterctx.x0, str.length), addr: enterctx.x0, size: str.length }],
                                    distData: [{ name: "x2", value: readHex(enterctx.x2, Process.pointerSize), addr: enterctx.x2, size: Process.pointerSize }]
                                };
                                break;
                            }
                        case "realloc":
                            {
                                log = {
                                    name: name,
                                    srcData: [
                                        { name: "x0", value: readHex(leavectx.x0, enterctx.x1 - 0), addr: enterctx.x0, size: enterctx.x1 },
                                        { name: "x1", value: enterctx.x1 }
                                    ],
                                    distData: [{ name: "ret", value: readHex(leavectx.x0, enterctx.x1 - 0), addr: enterctx.x0 }],
                                };
                                break;
                            }
                        case "dlsym":
                            {
                                var str = enterctx.x1.readCString();
                                log = {
                                    name: name,
                                    srcStr: [{ name: "x1", value: str }],
                                    srcData: [
                                        { name: "x1", value: readHex(enterctx.x1, str.length), addr: enterctx.x1, size: str.length },
                                        { name: "x0", value: enterctx.x0 }
                                    ]
                                };
                            }
                            break;
                        case "free":
                            {
                                log = {
                                    name: name,
                                    distData: [{ name: "x0", value: enterctx.x0 }]
                                };
                                break;
                            }
                        case "calloc":
                            {
                                log = {
                                    name: name,
                                    distData: [{ name: "x0", addr: leavectx.x0, size: enterctx.x0 * enterctx.x1 }]
                                };
                                break;
                            }
                        case "strftime":
                            {
                                log = {
                                    name: name,
                                    distData: [{ name: "x0", value: readHex(enterctx.x0, enterctx.x1), addr: leavectx.x0, size: enterctx.x1 }],
                                    constStr: [{ name: "x2", value: enterctx.x2.readCString() }]
                                };
                                break;
                            }
                    }
                }
            } else {
                stack.callback(stack.log, enterctx, leavectx);
                log = stack.log
            }
            if (log == null) {
                log = {
                    name: name
                }
            }

            log.retval = leavectx.x0;
            log.EnterCtxPos = stack.pos;
            log.leaveCtxPos = ctxpos;
            log.pc = enterctx.pc;
            log.moduleName = stack.moduleName;
            var logData = { type: "traceSymolFunc", body: log, traceId: this.traceId }

            //var txt = JSON.stringify(logData) + "\r\n";
            //var dir = "/sdcard/Download/" + this.traceId + "traceSymolFunc.log";
            //var ptr = Memory.allocUtf8String(txt);
            //var len = libcNative.strlen(ptr);
            //SavePtrToFileLibc(ptr, len, dir);

            fktraceLog(logData)
        }, "void", ['uint', 'pointer', 'pointer']),
        on_message: new NativeCallback((type, messagePtr) => { 
            if (type == 4) {
                this.openSigleLog = true;
                var msg = messagePtr.readUtf8String();
                //单步日志
                fKLog.kCLog({ traceCTXPC: msg, info: DebugSymbol.fromAddress(ptr("0x" + msg.substr(0, 16))) });
                return;
            }
            if (type == 5) {
                //调试日志
                fKLog.kCLog({ debugLog: messagePtr.readUtf8String() });
                return;
            }
            if (type == 1 && this.openSigleLog) {
                fKLog.kCLog(messagePtr.readUtf8String())
            }
            var message;
            if (type == 0) {
                this.ctxLogs = messagePtr;
                var cachecount = this.GetDataCacheCount();
                this.ctxcount += cachecount;
                this.ctxTotalCount += cachecount;
                var lastCtx = this.GetLastDataCtx();

                showLog(this, false);
                var log = {
                    inscount: this.inscount, ctxcount: this.ctxTotalCount, count: this.inscount + this.ctxTotalCount, pc: lastCtx.readPointer(), lr: DebugSymbol.fromAddress(getXRegister(lastCtx, "lr"))
                };
                log.msg = DebugSymbol.fromAddress(lastCtx.readPointer());
                fKLog.kCLog(log);
            } else if (type == 1 || type == 2) {
                this.inscount++;
                message = messagePtr.readUtf8String();
                if (type == 2) {
                    var ins = JSON.parse(message);
                    this.ins_addr[ptr(ins.addr)] = ins;
                }
                this.insLogs.push(message);
            } else {
                message = messagePtr.readUtf8String();
                fktraceLog({ name: message });
                return;
            }
        }, 'void', ['int', 'pointer'])
    });
    this.addr_returnStack = [];
    this.ins_addr = {};
    this.isTrace = false;
    this.isstrlen = false;
    this.isstrcmp = false;
    this.ismemcpy = false;
    this.isfree = false;
    this.block = "";
    this.blockinsn = [];
    this.blockctx = [];
    this.ctxMaxCount = 10000;
    this.ctxLogs;
    this.insLogs = [];
    this.blockLogs = [];
    this.ctxcount = 0;
    this.ctxTotalCount = 0;
    this.showcount = 0;
    this.hidebase = {};
    this.traceBaseCount = 0;
    this.userData = Memory.alloc(Process.pageSize);
    this.logsQue = [];
    this.pointerSize = Process.pointerSize;
    function fktraceLog(data, context, bin) {
        fKLog.kCLogName(data, context, "fktrace", bin)
    }
    this.fktraceLog = function (data) {
        data.traceId = this.traceId;
        data.taskname = this.taskname;
        data.traceName = this.traceName;
        data.test = "test";
        fKLog.kCLogName(data, null, "fktrace", null)
    }
    function showLog(that, end) {
        try {
            if (that.ctxcount > 0 || end) {

                //var filePath = "/sdcard/Download/fktrace_" + that.traceId + ".ctx";
                //var write = SavePtrToFileLibc(that.ctxLogs, 1024 * 1024, filePath);

                //fktraceLog({ type: "ctx", end: end, traceId: that.traceId, ins: that.insLogs }, null, null);
                fktraceLog({ type: "ctx", end: end, traceId: that.traceId, ins: that.insLogs }, null, that.ctxLogs.readByteArray(1024 * 1024));
                that.ctxcount = 0;
                that.insLogs = [];
            }
            that.logs = [];
        }
        catch (e) {
            fKLog.kCLog({ showLog: e });
        }
    }
    function GetModuleSymbol() {
        var moduleSymbol = [];
        Process.enumerateModules().forEach(function (module) {
            moduleSymbol.push({ modul: module })
        });
        return moduleSymbol;
    }
    this.stop = function () {
        Interceptor.revert(this.traceAddr)
    }
    this.SetSigleLogCtxPos = function (ctxpos) {
        this.SigleLogCtxPosPtr.writeInt(ctxpos)
    }
    this.AddTraceBase = function (base, maxbase) {

        this.userData.add(this.pointerSize * (1 + (this.traceBaseCount * 2))).writePointer(base)
        this.userData.add(this.pointerSize * (2 + (this.traceBaseCount * 2))).writePointer(maxbase)

        this.traceBaseCount++;
        this.userData.add(4).writeUInt(this.traceBaseCount);
    }
    this.SetExcludeAddress = function (address) {
        var ptrAddr = this.ExcludeAddressPtr;//.readPointer(); 
        var count = ptrAddr.readInt();
        for (var a = 0; a < address.length; a++) {
            var offset = (count * 2 + 1) * this.pointerSize;
            ptrAddr.add(offset).writePointer(address[a].address);
            ptrAddr.add(offset + this.pointerSize).writePointer(address[a].address.add(address[a].size));
            count++;
        }
        ptrAddr.writeUInt(count);
        fKLog.kCLog({ name: "SetExcludeAddress", count: count, ExcludeAddressPtr: this.ExcludeAddressPtr, ptrAddr, ptrAddr, address: address });
    }
    this.start = function () {
        this.isTrace = false;
        traceAddr(this, libname, traceOffset, traceRang, addr_names, beginEvent, endEvnet, moduleBase, exportsLibs)
    }
    this.ctxfile = null;
    function trackStart(that, taskname, traceName, targetModule, traceRang, addr_names, exportsLibs) {
        that.startTime = new Date().getTime();
        that.traceName = traceName;
        that.taskname = taskname;
        that.traceId = that.startTime + "-" + Math.random().toString().substring(2);
        that.tid = Process.getCurrentThreadId()

        var symbols = GetModuleSymbol();

        var jni = GetJniAddress();
        jni.forEach(function (item) {

            that.addr_name[ptr(item.address)] = {
                name: item.name, moduleName: "libart.so"
            }
        });
        var stubs = getModulePltStubs(targetModule.name);
        fKLog.kCLog({ name: targetModule.name, stubs })
        stubs.forEach(function (item) {
            that.addr_name[ptr(item.address)] = {
                name: item.symbol, moduleName: targetModule.name
            }
        });
        fKLog.kCLog({ addr_name: jni });
        Process.enumerateModules().forEach(function (module) {
            var exports = module.enumerateExports();
            for (var i = 0; i < exports.length; i++) {
                that.addr_name[ptr(exports[i].address)] = {
                    name: exports[i].name, moduleName: module.moduleName
                }
            }
        });
        if (addr_names != null && addr_names != undefined) {
            for (var i = 0; i < addr_names.length; i++) {
                 
                if (addr_names[i].moduleName == null || addr_names[i].moduleName == ""){
                    fKLog.kCLog({ name: "trackStart", addr: addr_names[i], e })
                    continue;
                }

                var model = Process.findModuleByName(addr_names[i].moduleName);
                for (var name in addr_names[i].symbols) {
                    that.addr_name[model.base.add(addr_names[i].symbols[name])] = {
                        name: name, moduleName: addr_names[i].moduleName
                    }
                    if (addr_names[i].callback != null) {
                        that.addr_name[model.base.add(addr_names[i].symbols[name])].callback = addr_names[i].callback[name];
                    }
                } 
            }
        }
        if (exportsLibs == null) {
            exportsLibs = ["libc.so", "libart.so"];
        }
        var libexports = {};
        for (var i = 0; i < exportsLibs.length; i++) {
            var libname = exportsLibs[i];
            var module = Process.findModuleByName(libname);
            fKLog.kCLog({ module: module, libname: libname });

            var exports = module.enumerateExports();
            for (var j = 0; j < exports.length; j++) {
                exports[j].offset = "0x" + (exports[j].address - module.base).toString(16);
            }
            if (libname == "libart.so") {
                var items = GetJniAddress();
                for (var j = 0; j < items.length; j++) {
                    exports.push(items[j]);
                }
            }
            libexports[libname] = exports;
        }

        that.traceModule = [];
        that.noTraceModule = [];

        if (traceRang.track) {
            that.userData.writeUInt(1);
        } else {
            that.userData.writeUInt(0);
        }

        for (var i = 0; i < traceRang.libs.length; i++) {
            var name = traceRang.libs[i];
            var libso = Process.findModuleByName(name);
            if (libso != null) {

                that.AddTraceBase(libso.base, libso.base.add(libso.size));
                if (traceRang.track) {
                    that.traceModule.push({ startBase: libso.base, endBase: libso.base.add(libso.size), size: libso.size, name: name });
                } else {
                    that.noTraceModule.push({ startBase: libso.base, endBase: libso.base.add(libso.size), size: libso.size, name: name });
                }
            }
        }


        that.inscount = 0;
        that.Fkida_agentBase = 0;

        fktraceLog({
            type: "StalkerTraceRangeCStart",
            traceId: that.traceId,
            exports: libexports,
            moduleBase: targetModule.base,
            modulesize: targetModule.size,
            taskname: taskname,
            traceName: that.traceName,
            traceModule: that.traceModule,
            noTraceModule: that.noTraceModule,
            symbols: symbols
        })
        Stalker.follow(that.tid, {
            transform: that.arm64CM.transform,
            onEvent: that.arm64CM.process,
            data: that.userData /* user_data */
        })
    }
    function trackEnd(that, ret) {
        var logcount = that.ctxcount + that.inscount;

        that.ctxLogs = that.GetDataCache();
        showLog(that, true);
        that.endTime = new Date().getTime();
        fktraceLog({
            time: that.endTime - that.startTime,
            timelog: (logcount / (that.endTime - that.startTime)).toFixed(4),
            count: logcount,
            logs: that.logs
        });

        that.endTime = new Date().getTime();
        Stalker.unfollow(that.tid);
        Stalker.garbageCollect()
        fktraceLog({
            time: that.endTime - that.startTime,
            timelog: (logcount / (that.endTime - that.startTime)).toFixed(4),
            count: logcount,
            traceId: that.traceId,
            taskname: that.taskname,
            traceName: that.traceName,
            type: "StalkerTraceRangeCFin",
        })

        for (var p in fileFdmap) {
            var fd = fileFdmap[p];
            if (fd == null) {
                continue;
            }
            libcNative.close(fd);
        }
        fileFdmap = {}
    }
    function isShow(that, returnAddress) {
        var show = false;

        for (var i = 0; i < that.traceModule.length; i++) {
            if (returnAddress > that.traceModule[i].startBase && returnAddress < that.traceModule[i].endBase) {
                show = true;
                break;
            }
        }
        for (var i = 0; i < that.noTraceModule.length; i++) {
            if (returnAddress > that.noTraceModule[i].startBase && returnAddress < that.noTraceModule[i].endBase) {
                show = false;
                break;
            }
        }
        if (!show) {
            if (that.hidebase[returnAddress] == null)
                that.hidebase[returnAddress] = 0;
            that.hidebase[returnAddress]++;

            return false;
        }
        that.showcount++;
        if (Process.getCurrentThreadId() == that.tid)
            return true;
        return false;
    }
    function traceAddr(that, libname, traceOffset, traceRang, addr_names, onBegin, onLeave, moduleBase) {

        var taskname = libname.replaceAll(".so", "").replaceAll(".", "_").replaceAll("-", "_");
        var mbase = Module.getBaseAddress(libname);

        let targetModule = null;
        if (moduleBase != undefined) {
            mbase = moduleBase;
            that.traceAddr = mbase.add(traceOffset);
            targetModule = { base: moduleBase, size: moduleBase }
        } else {
            let moduleMap = new ModuleMap();
            that.traceAddr = mbase.add(traceOffset);
            targetModule = moduleMap.find(that.traceAddr);
        }
        var traceName = traceOffset.toString(16) + "_" + mbase.toString(16)

        fktraceLog({ module: targetModule, addr: that.traceAddr })

        Interceptor.attach(that.traceAddr, {
            onEnter: function (args) {
                if (that.isTrace)
                    return;
                if (onBegin != null && !onBegin(args)) {
                    return;
                }
                this.isTrace = true;
                that.isTrace = true;
                fKLog.kCLog({ name: "trackStart", traceAddr: that.traceAddr })
                trackStart(that, taskname, traceName, targetModule, traceRang, addr_names, exportsLibs)

            },
            onLeave: function (ret) {

                if (!that.isTrace || !this.isTrace)
                    return;

                trackEnd(that, ret);
                if (onLeave != null && !onLeave(ret)) {
                    return;
                }
            }
        })
    }
    this.start();

    this.GetDataCacheCount = new NativeFunction(this.arm64CM.GetDataCacheCount, 'int', []);
    this.SendDataCache = new NativeFunction(this.arm64CM.SendDataCache, 'int', []);
    this.GetDataCache = new NativeFunction(this.arm64CM.GetDataCache, 'pointer', []);
    this.GetLastDataCtx = new NativeFunction(this.arm64CM.GetLastDataCtx, 'pointer', []);

}
//StalkerTraceRangeC End
