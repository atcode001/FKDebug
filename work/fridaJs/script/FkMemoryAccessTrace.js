jsname = "FkMemoryAccessTrace";



var mbase = Module.getBaseAddress('libsgmainso-6.5.115.so')
var mbpt = new MemoryBreakPointTrace((data) => {
    fKLog.kCLog(data);
});
mbpt.Add(mbase.add(0x3C884),4,"int3")