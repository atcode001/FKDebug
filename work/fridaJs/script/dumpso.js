function dumpso(name) {
    var libart = Process.getModuleByName(name);
    var dex_buffer = ptr(libart.base).readByteArray(libart.size);
    kCLogName({ name: name }, null, "dumpso", dex_buffer);
} 