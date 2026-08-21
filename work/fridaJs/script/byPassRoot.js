
(function () {
    function fKLog.kLog(msg) {
        var message = {};
        message["jsname"] = "byPassRoot";
        message["msg"] = msg;
        send(message);
    }
    function fKLog.kLog(msg, data) {
        var message = {};
        message["jsname"] = "byPassRoot";
        message["msg"] = msg;
        message["data"] = data;
        send(message);
    }
    function bypassPeopletechRoot() {
        try {

            let RootPermissionChecker = Java.use("com.peopletech.commonbusiness.safe.root.RootPermissionChecker");
            if (RootPermissionChecker != null) {
                fKLog.kLog("hook  RootPermissionChecker");
                RootPermissionChecker.checkRootPermission.implementation = function () {
                    fKLog.kLog("过root检测")
                    return false;
                }
            } else {
                fKLog.kLog("RootPermissionChecker null");
            }
            let SafeChecker = Java.use("com.peopletech.commonbusiness.safe.SafeChecker");
            if (SafeChecker != null) {
                fKLog.kLog("hook  isNotSafe");
                SafeChecker["isNotSafe"].implementation = function (activity) {
                    fKLog.kLog('isNotSafe is called' + ', ' + 'activity: ' + activity);
                    let ret = this.isNotSafe(activity);
                    fKLog.kLog('isNotSafe ret value is ' + ret);
                    return false;
                };
            } else {
                fKLog.kLog("SafeChecker null");
            }

            

            let ArmsUtils = Java.use("com.peopletech.arms.utils.ArmsUtils");
            ArmsUtils["exitApp"].implementation = function () {
                return;
            };
            return true;
        }
        catch {

        }
        setTimeout(bypassPeopletechRoot, 1);
        return false;
    }

    fKLog.kCLog("11111")
    bypassPeopletechRoot();
    anti_abort();
})();
 
fKLog.kCLog("byPassRoot")