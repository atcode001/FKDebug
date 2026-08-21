//默认使用,后面再搞点默认hook功能
(function () {
    function ShowSymbol() {
        var show = {};
        Process.enumerateModules().forEach(function (module) {
            if (show[module.name] != null)
                return;

            var r = [];
            var count = 0;
            module.enumerateExports().forEach(function (edata) {
                r.push({ name: edata.name, address: edata.address, type: edata.type, tt: "symbol" });
                count++;
            });
            fKLog.kLog({ module: module, count: count, Exports: r });
            show[module.name] = true; 
        });
    }
    function main() {
        klogData(null, "", "init", "ShowSymbol.js init hook success")
        ShowSymbol();
    }
    setImmediate(main);

})();


