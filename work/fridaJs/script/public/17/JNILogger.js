
function JNILogger() {

    function parseJValueArrayWithSig(argsPtr, signature) {

        if (!argsPtr || (argsPtr.isNull && argsPtr.isNull())) return [];

        // 解析签名中参数部分为类型 token 列表
        function tokenizeParams(sig) {
            fKLog.kCLog({ sig, match: sig.match })
            var m = sig.match(/^\((.*)\)/);
            var s = m ? m[1] : "";
            var types = [];
            var i = 0;
            while (i < s.length) {
                var ch = s.charAt(i);
                if (ch === 'L') {
                    var semi = s.indexOf(';', i);
                    if (semi === -1) { types.push(s.substring(i)); break; }
                    types.push(s.substring(i, semi + 1)); // L...;
                    i = semi + 1;
                } else if (ch === '[') {
                    var j = i;
                    while (s.charAt(j) === '[') j++;
                    if (s.charAt(j) === 'L') {
                        var semi2 = s.indexOf(';', j);
                        if (semi2 === -1) { types.push(s.substring(i)); break; }
                        types.push(s.substring(i, semi2 + 1)); // [L...;
                        i = semi2 + 1;
                    } else {
                        // 基本类型数组，如 [I
                        types.push(s.substring(i, j + 1));
                        i = j + 1;
                    }
                } else {
                    types.push(ch);
                    i++;
                }
            }
            return types;
        }

        function jniToReadable(t) {
            if (!t) return "";
            if (t.charAt(0) === '[') return jniToReadable(t.substring(1)) + "[]";
            if (t.charAt(0) === 'L') return t.substring(1, t.length - 1).replace(/\//g, '.');
            switch (t) {
                case 'B': return 'byte';
                case 'C': return 'char';
                case 'D': return 'double';
                case 'F': return 'float';
                case 'I': return 'int';
                case 'J': return 'long';
                case 'S': return 'short';
                case 'Z': return 'boolean';
                case 'V': return 'void';
                default: return t;
            }
        }

        // helpers for float/double reads (little-endian)
        function readFloat32(ptrAddr) {
            try {
                var buf = Memory.readByteArray(ptrAddr, 4);
                if (!buf) return null;
                var dv = new DataView(buf);
                return dv.getFloat32(0, true);
            } catch (e) { return null; }
        }
        function readFloat64(ptrAddr) {
            try {
                var buf = Memory.readByteArray(ptrAddr, 8);
                if (!buf) return null;
                var dv = new DataView(buf);
                return dv.getFloat64(0, true);
            } catch (e) { return null; }
        }

        var types = tokenizeParams(signature || "");
        var slotSize = Process.pointerSize; // jvalue slots usually pointer-size (8 on arm64)
        var results = [];

        for (var i = 0; i < types.length; i++) {
            var t = types[i];
            var readable = jniToReadable(t);
            var itemAddr = ptr(argsPtr).add(i * slotSize);
            var entry = { index: i, sig: t, readable: readable, raw: null, value: null, className: null };
            fKLog.kCLog("parseJValueArrayWithSig   111")
            try {
                // 对象/数组 类型：读取 pointer
                if (t.charAt(0) === 'L' || t.charAt(0) === '[') {
                    fKLog.kCLog("parseJValueArrayWithSig   222222 " + t)
                    var rawPtr = itemAddr.readPointer();
                    if (t === 'Ljava/lang/String;') {
                        try {
                            if (Java && Java.available) {
                                Java.performNow(function () {
                                    try {
                                        var jstr = Java.cast(rawPtr, Java.use('java.lang.String'));
                                        entry.value = jstr ? jstr.toString() : null;
                                    } catch (ee) {
                                        entry.value = null;
                                    }
                                });
                            }
                        } catch (ee) { }
                    }
                    fKLog.kCLog("parseJValueArrayWithSig   333333")
                } else {
                    fKLog.kCLog("parseJValueArrayWithSig   444444")
                    // 原始类型：按签名对应读取
                    switch (t) {
                        case 'Z': // boolean -> low 32-bit
                            try { entry.value = !!itemAddr.readS32(); } catch (e) { entry.value = null; }
                            break;
                        case 'B': // byte
                            try { entry.value = itemAddr.readS8 ? itemAddr.readS8() : (itemAddr.readS32() & 0xff); } catch (e) { entry.value = null; }
                            break;
                        case 'C': // char (unsigned 16)
                            try { var v = itemAddr.readU16 ? itemAddr.readU16() : (itemAddr.readS32() & 0xffff); entry.value = String.fromCharCode(v); } catch (e) { entry.value = null; }
                            break;
                        case 'S': // short
                            try { entry.value = itemAddr.readS16 ? itemAddr.readS16() : (itemAddr.readS32() & 0xffff); } catch (e) { entry.value = null; }
                            break;
                        case 'I': // int
                            try { entry.value = itemAddr.readS32(); } catch (e) { entry.value = null; }
                            break;
                        case 'J': // long 64-bit
                            try { var v64 = itemAddr.readS64(); entry.value = v64.toString(); } catch (e) { entry.value = null; }
                            break;
                        case 'F': // float
                            try { entry.value = readFloat32(itemAddr); } catch (e) { entry.value = null; }
                            break;
                        case 'D': // double
                            try { entry.value = readFloat64(itemAddr); } catch (e) { entry.value = null; }
                            break;
                        default:
                            // 未知，读取原始 pointer/slot 作为回退
                            try { entry.raw = itemAddr.readPointer(); entry.value = entry.raw ? entry.raw.toString() : null; } catch (e) { entry.value = null; }
                            break;
                    }
                    fKLog.kCLog("parseJValueArrayWithSig   55555")
                }
            } catch (e) {
                try { fKLog.kCLog({ name: "parseJValueItem_error", idx: i, e: e.toString() }); } catch (ee) { }
            }

            results.push(entry.sig + "=>" + entry.value);
        }

        return results;
    }
    function prettyMethod(method_id, withSignature) {
        const result = new StdString();
        Java.api['art::ArtMethod::PrettyMethod'](result, method_id, withSignature ? 1 : 0);
        return result.disposeToString();
    }
    this.parseMethodSignature = function (signature) {
        if (!signature)
            return { params: [], returnType: "", rawParams: [], rawReturn: "", jniSignature: "" };

        // 把 JNI token 转为可读类型（保留）
        function jniToReadable(t) {
            if (!t) return "";
            if (t.charAt(0) === '[') return jniToReadable(t.substring(1)) + "[]";
            if (t.charAt(0) === 'L') return t.substring(1, t.length - 1).replace(/\//g, '.');
            switch (t) {
                case 'B': return 'byte';
                case 'C': return 'char';
                case 'D': return 'double';
                case 'F': return 'float';
                case 'I': return 'int';
                case 'J': return 'long';
                case 'S': return 'short';
                case 'Z': return 'boolean';
                case 'V': return 'void';
                default: return t;
            }
        }

        // 从可读类型（pretty）转换为 JNI token
        function readableToJni(typeStr) {
            if (!typeStr) return "";
            var t = typeStr.trim();
            // 去掉泛型参数 <...>
            while (true) {
                var lt = t.indexOf('<');
                if (lt === -1) break;
                var depth = 0, i;
                for (i = lt; i < t.length; i++) {
                    if (t.charAt(i) === '<') depth++;
                    else if (t.charAt(i) === '>') {
                        depth--;
                        if (depth === 0) break;
                    }
                }
                if (i >= t.length) { t = t.substring(0, lt); break; }
                t = t.substring(0, lt) + t.substring(i + 1);
            }

            // 处理数组符号 "[]"
            var arrDepth = 0;
            while (t.endsWith("[]")) {
                arrDepth++;
                t = t.substring(0, t.length - 2).trim();
            }

            // 基本类型映射
            var prim = {
                "byte": "B", "char": "C", "double": "D", "float": "F",
                "int": "I", "long": "J", "short": "S", "boolean": "Z", "void": "V"
            };
            var base;
            if (prim[t]) base = prim[t];
            else {
                // 类名转为 Lxxx/yyy/Name;
                base = "L" + t.replace(/\./g, "/") + ";";
            }
            return ("[".repeat(arrDepth) + base);
        }

        // 先尝试 JNI 风格 ( ... )R
        var m = signature.match(/^\((.*)\)(.*)$/);
        if (m) {
            var paramsPart = m[1] || "";
            var retPart = m[2] || "";

            // token 化参数（支持 L...; 和 [..）
            function tokenizeParamsJni(s) {
                var types = [];
                var i = 0;
                while (i < s.length) {
                    var ch = s.charAt(i);
                    if (ch === 'L') {
                        var semi = s.indexOf(';', i);
                        if (semi === -1) { types.push(s.substring(i)); break; }
                        types.push(s.substring(i, semi + 1));
                        i = semi + 1;
                    } else if (ch === '[') {
                        var j = i;
                        while (s.charAt(j) === '[') j++;
                        if (s.charAt(j) === 'L') {
                            var semi2 = s.indexOf(';', j);
                            if (semi2 === -1) { types.push(s.substring(i)); break; }
                            types.push(s.substring(i, semi2 + 1));
                            i = semi2 + 1;
                        } else {
                            types.push(s.substring(i, j + 1));
                            i = j + 1;
                        }
                    } else {
                        types.push(ch);
                        i++;
                    }
                }
                return types;
            }

            var rawParams = tokenizeParamsJni(paramsPart);
            var params = rawParams.map(jniToReadable);
            var returnType = jniToReadable(retPart);
            var jniSignature = "(" + rawParams.join("") + ")" + retPart;
            return { params: params, returnType: returnType, rawParams: rawParams, rawReturn: retPart, jniSignature: jniSignature };
        }

        // 处理 prettyMethod / Java 风格： "java.util.List java.util.Arrays.asList(java.lang.Object[])"
        // 需要把参数与返回转换为 JNI token
        var m2 = signature.match(/^(.*?)\s+[^\s]+\((.*)\)$/);
        if (m2) {
            var retText = (m2[1] || "").trim();
            var paramsText = (m2[2] || "").trim();

            // 按逗号分割参数，但要忽略泛型内逗号（实现简单的括号深度检测）
            var parts = [];
            var cur = "", depth = 0;
            for (var i = 0; i < paramsText.length; i++) {
                var ch = paramsText.charAt(i);
                if (ch === '<') { depth++; cur += ch; }
                else if (ch === '>') { if (depth > 0) depth--; cur += ch; }
                else if (ch === ',' && depth === 0) {
                    parts.push(cur.trim());
                    cur = "";
                } else {
                    cur += ch;
                }
            }
            if (cur.trim().length > 0) parts.push(cur.trim());

            var rawParams = [];
            var paramsReadable = [];
            for (var j = 0; j < parts.length; j++) {
                var p = parts[j];
                if (!p || p.length === 0) continue;
                paramsReadable.push(p);
                rawParams.push(readableToJni(p));
            }
            var rawReturn = readableToJni(retText);
            var paramsHuman = paramsReadable;
            var jniSignature = "(" + rawParams.join("") + ")" + rawReturn;
            return { params: paramsHuman, returnType: retText, rawParams: rawParams, rawReturn: rawReturn, jniSignature: jniSignature };
        }

        // 无法识别的兜底，返回原文并尝试以 pretty 风格做一次简单转换
        var simpleRaw = [];
        var simpleParams = [];
        var r = signature;
        var sp = signature.indexOf('(');
        if (sp !== -1) {
            var ret = signature.substring(0, sp).trim().split(/\s+/)[0] || signature;
            var pt = signature.substring(sp + 1, signature.lastIndexOf(')'));
            if (pt && pt.length > 0) {
                pt.split(',').forEach(function (p) {
                    var t = p.trim();
                    if (t.length === 0) return;
                    simpleParams.push(t);
                    simpleRaw.push(readableToJni(t));
                });
            }
            var simpleRawReturn = readableToJni(ret);
            return { params: simpleParams, returnType: ret, rawParams: simpleRaw, rawReturn: simpleRawReturn, jniSignature: "(" + simpleRaw.join("") + ")" + simpleRawReturn };
        }

        return { params: [], returnType: signature, rawParams: [], rawReturn: signature, jniSignature: "" };
    }
    this.parseJniReturn = function (env, retval, sigOrRawReturn) {
        // sigOrRawReturn: 可以是完整 JNI 方法签名 "(...)R"、也可以是 rawReturn "Ljava/lang/String;" 或可读返回类型 "java.lang.String"
        if (sigOrRawReturn == null)
            return { type: "unknown", value: null, raw: null };

        // 如果传入的是完整方法签名，抽取返回部分
        var raw = sigOrRawReturn;
        var m = raw.match(/^\(.*\)(.*)$/);
        if (m) raw = m[1];

        // 如果是可读类型（例如 "java.lang.String"），尝试转换为 JNI token L...;
        if (raw.indexOf('.') !== -1 && raw.indexOf('/') === -1 && raw.charAt(0) !== 'L' && raw.charAt(0) !== '[') {
            raw = "L" + raw.replace(/\./g, "/") + ";";
        }

        // 处理 void
        if (raw === "V" || raw === "" || raw == null) {
            return { type: "void", value: null, raw: raw };
        }

        // 对象或数组
        if (raw.charAt(0) === 'L' || raw.charAt(0) === '[') {
            return { type: raw, value: this.getRefObjetToString(env, retval, raw), sig: raw };
        }
        // 原始基本类型（以寄存器值为准）
        try {
            // retval 可能是 number 或 ptr-like，先转换为 number（fallback）
            var nval = (typeof retval === 'number') ? retval : Number(retval);
            switch (raw) {
                case 'I': return { type: 'int', value: nval | 0, raw: raw };
                case 'Z': return { type: 'boolean', value: !!nval, raw: raw };
                case 'B': return { type: 'byte', value: nval & 0xff, raw: raw };
                case 'C': return { type: 'char', value: String.fromCharCode(nval & 0xffff), raw: raw };
                case 'S': return { type: 'short', value: nval & 0xffff, raw: raw };
                case 'J':
                    // long 可能超出 JS 安全整数，保留字符串表示
                    try { return { type: 'long', value: (typeof retval === 'object' && retval.toString) ? retval.toString() : String(nval), raw: raw }; }
                    catch (e) { return { type: 'long', value: String(nval), raw: raw }; }
                case "float":
                case 'F':
                    return {
                        type: 'float', value: fkConvert.BigIntToFloat(retval), raw: raw
                    };
                case "double":
                case 'D':
                    return {
                        type: 'double', value: fkConvert.BigIntToDouble(retval), raw: raw
                    };
                default: return { type: raw, value: nval, raw: raw, case: "default" };
            }
        } catch (e) {
            return { type: raw, value: null, raw: raw, error: e.toString() };
        }
    }

    this.readJIntPointer = function (ptrAddr, length) {
        try {
            if (!ptrAddr || !length || length <= 0) return [];
            var result = [];
            for (var i = 0; i < length; i++) {
                try {
                    // jint 为 32-bit signed
                    var v = ptrAddr.add(i * 4).readS32();
                    result.push(v);
                } catch (e) {
                    result.push(null);
                }
            }
            return result;
        } catch (e) {
            return [];
        }
    }
    this.readJFloatPointer = function (ptrAddr, length) {
        if (!ptrAddr || !length || length <= 0) return [];

        var ab = Memory.readByteArray(ptrAddr, length * 4);
        if (ab) {
            var dv = new DataView(ab);
            var res = new Array(length);
            for (var i = 0; i < length; i++) {
                res[i] = dv.getFloat32(i * 4, true);
            }
            return res;
        }
        return [];
    }
    this.readJDoublePointer = function (ptrAddr, length) {
        if (!ptrAddr || !length || length <= 0) return [];

        var ab = Memory.readByteArray(ptrAddr, length * 4);
        if (ab) {
            var dv = new DataView(ab);
            var res = new Array(length);
            for (var i = 0; i < length; i++) {
                res[i] = dv.getFloat64(i * 4, true);
            }
            return res;
        }
        return [];
    }
    this.readJBytePointer = function (ptrAddr, length, signed) {
        // signed: true (jbyte) => readS8, false => readU8 (optional)
        try {
            if (!ptrAddr || !length || length <= 0) return [];
            var res = [];
            var useSigned = (signed === undefined) ? true : !!signed; // jbyte 默认有符号
            for (var i = 0; i < length; i++) {
                try {
                    if (useSigned)
                        res.push(ptrAddr.add(i).readS8());
                    else
                        res.push(ptrAddr.add(i).readU8());
                } catch (e) {
                    res.push(null);
                }
            }
            return res;
        } catch (e) {
            return [];
        }
    }
    this.readJString = function (env, jstr) {
        if (!jstr || ptr(jstr).isNull())
            return "readJString1 value is null";
        var chars = this.GetStringUTFChars(env, jstr, ptr(0));
        if (!chars || ptr(chars).isNull())
            return "readJString2 value is null";
        var s = Memory.readUtf8String(chars);
        return s || "readJString3 value is null";
    }
    this.getJObjectInfoInternal = function (env, obj, classInfo) {
        if (classInfo == null)
            classInfo = this.jniGetClassName(env, obj);
        // 参数校验
        if (!classInfo || obj == null || (ptr(obj) && ptr(obj).isNull && ptr(obj).isNull())) {
            return "getJObjectInfoInternal value is null";
        }

        var self = this;

        // 确保 jni 缓存容器存在
        if (!this.jni)
            this.jni = {};

        // 规范 classInfo：Ljava/lang/Foo; -> java.lang.Foo
        function normalizeClassInfo(ci) {
            if (!ci) return ci;
            if (ci.charAt(0) === 'L' && ci.charAt(ci.length - 1) === ';') {
                ci = ci.substring(1, ci.length - 1).replace(/\//g, '.');
            }
            return ci;
        }

        //读取jstring


        var ci = normalizeClassInfo(classInfo);
        var ret = "";

        switch (ci) {
            case "boolean":
            case "java.lang.Boolean": {
                // 严格按第一个分支格式：缓存 mid（同时缓存 class 以避免重复 FindClass 问题）
                if (this.jni.BooleanToString_mid == undefined) {
                    this.jni.Boolean_class = this.FindClass(env, Memory.allocUtf8String("java/lang/Boolean"));
                    this.jni.BooleanToString_mid = this.GetStaticMethodID(env, this.jni.Boolean_class, Memory.allocUtf8String("toString"), Memory.allocUtf8String("(Z)Ljava/lang/String;"));
                }
                var cls = this.jni.Boolean_class;
                var jStr = this.CallStaticObjectMethod(env, cls, this.jni.BooleanToString_mid, obj);
                ret = this.readJString(env, jStr);
                break;
            }
            case "byte":
            case "java.lang.Byte": {
                if (this.jni.ByteToString_mid == undefined) {
                    this.jni.Byte_class = this.FindClass(env, Memory.allocUtf8String("java/lang/Byte"));
                    this.jni.ByteToString_mid = this.GetStaticMethodID(env, this.jni.Byte_class, Memory.allocUtf8String("toString"), Memory.allocUtf8String("(B)Ljava/lang/String;"));
                }
                var cls = this.jni.Byte_class;
                var jStr = this.CallStaticObjectMethod(env, cls, this.jni.ByteToString_mid, obj);
                ret = this.readJString(env, jStr);
                break;
            }
            case "char":
            case "java.lang.Character": {
                if (this.jni.CharacterToString_mid == undefined) {
                    this.jni.Character_class = this.FindClass(env, Memory.allocUtf8String("java/lang/Character"));
                    this.jni.CharacterToString_mid = this.GetStaticMethodID(env, this.jni.Character_class, Memory.allocUtf8String("toString"), Memory.allocUtf8String("(C)Ljava/lang/String;"));
                }
                var cls = this.jni.Character_class;
                var jStr = this.CallStaticObjectMethod(env, cls, this.jni.CharacterToString_mid, obj);
                ret = this.readJString(env, jStr);
                break;
            }
            case "short":
            case "java.lang.Short": {
                if (this.jni.ShortToString_mid == undefined) {
                    this.jni.Short_class = this.FindClass(env, Memory.allocUtf8String("java/lang/Short"));
                    this.jni.ShortToString_mid = this.GetStaticMethodID(env, this.jni.Short_class, Memory.allocUtf8String("toString"), Memory.allocUtf8String("(S)Ljava/lang/String;"));
                }
                var cls = this.jni.Short_class;
                var jStr = this.CallStaticObjectMethod(env, cls, this.jni.ShortToString_mid, obj);
                ret = this.readJString(env, jStr);
                break;
            }
            case "int":
            case "java.lang.Integer": {
                if (this.jni.IntegerToString_mid == undefined) {
                    this.jni.Integer_class = this.FindClass(env, Memory.allocUtf8String("java/lang/Integer"));
                    this.jni.IntegerToString_mid = this.GetStaticMethodID(env, this.jni.Integer_class, Memory.allocUtf8String("toString"), Memory.allocUtf8String("(I)Ljava/lang/String;"));
                }
                var jStr = this.CallStaticObjectMethod(env, this.jni.Integer_class, this.jni.IntegerToString_mid, obj);
                ret = this.readJString(env, jStr);
                break;
            }
            case "float":
            case "java.lang.Float": {
                if (this.jni.FloatToString_mid == undefined) {
                    this.jni.Float_class = this.FindClass(env, Memory.allocUtf8String("java/lang/Float"));
                    this.jni.FloatToString_mid = this.GetStaticMethodID(env, this.jni.Float_class, Memory.allocUtf8String("toString"),
                        Memory.allocUtf8String("(F)Ljava/lang/String;"));
                }
                var cls = this.jni.Float_class;
                var jStr = this.CallStaticObjectMethod(env, cls, this.jni.FloatToString_mid, obj);
                ret = this.readJString(env, jStr);
                break;
            }
            case "double":
            case "java.lang.Double": {
                if (this.jni.DoubleToString_mid == undefined) {
                    this.jni.Double_class = this.FindClass(env, Memory.allocUtf8String("java/lang/Double"));
                    this.jni.DoubleToString_mid = this.GetStaticMethodID(env, this.jni.Double_class, Memory.allocUtf8String("toString"), Memory.allocUtf8String("(D)Ljava/lang/String;"));
                }
                var cls = this.jni.Double_class;
                var jStr = this.CallStaticObjectMethod(env, cls, this.jni.DoubleToString_mid, obj);
                ret = this.readJString(env, jStr);
                break;
            }
            case "long":
            case "java.lang.Long": {
                if (this.jni.LongToString_mid == undefined) {
                    this.jni.Long_class = this.FindClass(env, Memory.allocUtf8String("java/lang/Long"));
                    this.jni.LongToString_mid = this.GetStaticMethodID(env, this.jni.Long_class, Memory.allocUtf8String("toString"), Memory.allocUtf8String("(J)Ljava/lang/String;"));
                }
                var cls = this.jni.Long_class;
                var jStr = this.CallStaticObjectMethod(env, cls, this.jni.LongToString_mid, obj);
                var obb = this.GetObjectClass(env, jStr);
                fKLog.kCLog({ name: "jniGetClassName", cls: this.jniGetClassName(env, obb) })//"java.lang.String"

                ret = this.readJString(env, jStr);
                break;
            }
            case "Ljava.lang.String;":
            case "java.lang.String": {

                ret = this.readJString(env, obj);

                // 调用 GetObjectClass 得到 jclass

                break;
            }
            default: {
                ret = this.getRefObjetToString(env, obj, ci);
                break;
            }
        }

        if (this.ExceptionCheck(env)) {
            this.ExceptionClear(env);
        }

        return ret;
    }
    this.getRefObjetToString = function (env, objPtr, sig) {

        if (sig === "[B") {
            // 优先使用 GetArrayLength + GetByteArrayElements（若 initJni 已映射） 
            var len = parseInt(this.GetArrayLength(env, objPtr));
            if (len > 0) {
                var elems = this.GetByteArrayElements(env, objPtr, 0);
                if (elems && !ptr(elems).isNull()) {
                    var ab = Memory.readByteArray(elems, len);
                    var u8 = new Uint8Array(ab || []);
                    var hex = fkConvert.bytesToHex(u8);
                    var base64 = fkConvert.bytesToBase64(u8);
                    return { hex, base64, size: len };
                }
            } else {
                // len == 0 返回空数组
                return { hex: "", base64: "" };
            }
        }
        if (sig == "[F") {
            var len = parseInt(this.GetArrayLength(env, objPtr));
            if (!len || len <= 0)
                return [];

            var elems = this.GetFloatArrayElements(env, objPtr, 0);
            if (!elems || ptr(elems).isNull()) {
                return [];
            }
            return this.readJFloatPointer(elems, len);
        }


        if (sig === 'Ljava/lang/String;' || sig === 'java/lang/String') {
            return this.readJString(env, objPtr);
        }
        // jstring 特殊处理
        //[Ljava.lang.String;
        //[Ljava/lang/String;
        if (sig === "[Ljava.lang.String;" || sig == "[Ljava/lang/String;") {
            var len = parseInt(this.GetArrayLength(env, objPtr));
            if (!len || len <= 0)
                return [];
            var ary = [];
            for (var i = 0; i < len; i++) {
                var jstr = this.GetObjectArrayElement(env, objPtr, i);
                if (!jstr || ptr(jstr).isNull()) {
                    ary.push(null);
                    continue;
                }
                // 使用已有的 readJString 读取字符串内容（含容错）
                var s = null;
                try {
                    s = this.readJString(env, jstr);
                } catch (e) {
                    s = null;
                }
                ary.push(s);
            }
            return ary;
        }
        if (sig == "[Ljava.lang.Object;" || sig[0] == '[') {
            var len = parseInt(this.GetArrayLength(env, objPtr));
            if (!len || len <= 0)
                return [];
            var result = [];
            for (var i = 0; i < len; i++) {

                var elem = this.GetObjectArrayElement(env, objPtr, i);
                if (!elem || ptr(elem).isNull()) {
                    result.push(null);
                    continue;
                }
                result.push(this.getJObjectToString(env, elem));
            }
            return result;
        }
        // 其它对象/数组：使用已有解析器（getJObjectInfoInternal）

        return this.getJObjectToString(env, objPtr, sig);
    }
    this.getJObjectToString = function (env, obj) {

        if (this.jni.method_id_toString == undefined) {
            var clsNamePtr = Memory.allocUtf8String("java/lang/Object");
            var toStringptr = Memory.allocUtf8String("toString");
            var sigptr = Memory.allocUtf8String("()Ljava/lang/String;");
            this.jni.method_id_toString = this.GetMethodID(env, this.FindClass(env, clsNamePtr), toStringptr, sigptr);
        }
        var robj = this.CallObjectMethod(env, obj, this.jni.method_id_toString);
        var r = this.GetStringUTFChars(env, robj, ptr(0));
        var r2 = Memory.readUtf8String(r);
        return r2;
    }
    this.getArgsInfo = function (env, obj, jmethodId, args, isStatic, debug) {

        var pJclass = this.GetObjectClass(env, obj);
        //var classInfo = this.getJObjectClassInfo(env, objClass);

        //获取被调用的方法信息
        var invokeMethod = this.ToReflectedMethod(env, pJclass, jmethodId, isStatic);

        //打印被调用方法信息,只需要调用他的toString
        //getJObjectInfoInternal(env, invokeMethod, classInfo);


        var objclass = this.GetObjectClass(env, invokeMethod);

        var getParameterCount_ptr = Memory.allocUtf8String("getParameterCount");
        var getParameterCount_sig_ptr = Memory.allocUtf8String("()I");
        var parCountId = this.GetMethodID(env, objclass, getParameterCount_ptr, getParameterCount_sig_ptr);

        // 获取方法长度
        var size = this.CallIntMethod(env, invokeMethod, parCountId);
        if (size == 0) {
            //长度等于0直接return,不打印参数信息
            return;
        }


        var getParameterTypes_ptr = Memory.allocUtf8String("getParameterTypes");
        var getParameterTypes_sig_ptr = Memory.allocUtf8String("()[Ljava/lang/Class;");
        var method_id_getTypes = this.GetMethodID(env, objclass, getParameterTypes_ptr, getParameterTypes_sig_ptr);
        var objectArray = this.CallObjectMethod(env, invokeMethod, method_id_getTypes);
        if (debug)
            fKLog.kCLog({
                name: "getArgsInfo", env, ToReflectedMethod: this.ToReflectedMethod, pJclass, jmethodId,
                isStatic, size, ret
            })
        var ret = [];
        var i = 0;
        if (!isStatic) {
            var j_className = this.jniGetClassName(env, pJclass);
            var r = this.getJObjectInfoInternal(env, obj, j_className)
            ret.push({ sig: arg_classInfo, v: r, ptr: arg }); 
        }
        for (; i < size; i++) {
            var argobj = this.GetObjectArrayElement(env, objectArray, i);
            if (argobj == null) {
                continue;
            }

            //具体每个类型的class
            var arg_classInfo = this.jniGetClassName(env, argobj);
            var arg = ptr(args).add(i * Process.pointerSize).readPointer();

            if (arg_classInfo != "java.lang.Throwable" && arg_classInfo !="java.lang.reflect.Method") {                 
                if (debug)
                    fKLog.kCLog({ name: "getArgsInfo ", arg: arg, arg_classInfo })
                var r = this.getJObjectInfoInternal(env, argobj, arg_classInfo)
                ret.push({ sig: arg_classInfo, v: r, ptr: arg });
                if (debug)
                    fKLog.kCLog({ name: "getArgsInfo", param: r }) 
            } else {
                ret.push({ sig: arg_classInfo, v: arg_classInfo, ptr: arg });
            }

        }
        //fKLog.kCLog({ name: "getArgsInfo return", env, ToReflectedMethod: this.ToReflectedMethod, pJclass, jmethodId, isStatic, size, ret })
        return ret;
    }
    this.initJni = function () {
        var jni = GetJniAddress();
        for (var i = 0; i < jni.length; i++) {
            switch (jni[i].name) {
                case "NewObject":
                    this[jni[i].name] = new NativeFunction(jni[i].address, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer', 'pointer']);
                    break;
                case "ToReflectedMethod":
                    this[jni[i].name] = new NativeFunction(jni[i].address, 'pointer', ['pointer', 'pointer', 'pointer', 'int']);
                    break;
                case "CallStaticObjectMethod":
                case "GetStaticMethodID":
                case "GetMethodID":
                    this[jni[i].name] = new NativeFunction(jni[i].address, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']);
                    break;
                case "GetByteArrayElements":
                case "GetFloatArrayElements":
                case "GetObjectArrayElement":
                    this[jni[i].name] = new NativeFunction(jni[i].address, 'pointer', ['pointer', 'pointer', 'int']);
                    break;
                case "CallIntMethod":
                case "GetStringUTFChars":
                case "ReleaseStringUTFChars":
                case "CallObjectMethod":
                    this[jni[i].name] = new NativeFunction(jni[i].address, 'pointer', ['pointer', 'pointer', 'pointer']);
                    break;
                case "FindClass":
                case "GetObjectClass":
                case "DeleteLocalRef":
                case "NewStringUTF":
                case "GetArrayLength":
                    this[jni[i].name] = new NativeFunction(jni[i].address, 'pointer', ['pointer', 'pointer']);
                    break;
                case "ExceptionClear":
                case "ExceptionCheck":
                    this[jni[i].name] = new NativeFunction(jni[i].address, 'pointer', ['pointer']);
                    break;

            }
        }
        this.jni = { classzz: null, classGetName: null }
    }

    this.initJni();
    get_jave_vm_Env();
    this.jni_context = {};
    this.ref_class = {};
    this.MethodIDs = {};

    this.jniGetClassName = function (env, jclass) {
        var jniInfo = this.jni;
        if (jniInfo.classzz == null) {
            var clsNamePtr = Memory.allocUtf8String("java/lang/Class");
            //fKLog.kCLog({ name: "jniGetClassName", findclass: this.findclass, env, clsNamePtr })
            jniInfo.classzz = this.FindClass(env, clsNamePtr);
        }
        if (jniInfo.classGetName == null) {
            // 获取 getName 方法（与 C++ 中 getName() 对应）
            var namePtr = Memory.allocUtf8String("getName");
            var sigPtr = Memory.allocUtf8String("()Ljava/lang/String;");
            var mid = this.GetMethodID(env, jniInfo.classzz, namePtr, sigPtr);
            if (ptr(mid).isNull())
                return "";
            jniInfo.classGetName = mid;
        }
        fKLog.kCLog({env,jclass,jniInfo});
        // 调用方法，得到 jstring
        var jstr = this.CallObjectMethod(env, jclass, jniInfo.classGetName);
        if (!jstr || ptr(jstr).isNull())
            return "";

        // 将 jstring 转为 C 字符串并读取
        var chars = this.GetStringUTFChars(env, jstr, ptr(0));
        var className = "";
        if (chars && !ptr(chars).isNull()) {
            className = Memory.readUtf8String(ptr(chars));
        }

        return className || "";

    }
    this.GetClassName = function (handle) {
        if (this.ref_class[handle]) {
            if (this.ref_class[handle] == handle)
                return "";
            var r = this.GetClassName(this.ref_class[handle]);
            if (r == "")
                return this.ref_class[handle]
            else
                return r;
        }
        if (handle > 0xFFFF) {
            fKLog.kCLog({ name: "GetClassName", handle })
            // return get_jave_vm_Env().getClassName(handle);

            return handle.toString();
        }
        return "";
    }
    this.Enter = function (jni_name, ctx) { 
        var class_name = "";
        var enterData = {};
        enterData.ctx = ctx;
        fKLog.kCLog({ jni_name, event: "onenter", ctx })
        switch (jni_name) {
            case "GetObjectClass":
                {
                    var class_name = "";// this.jniGetClassName(ctx.x0, ctx.x1);                     
                    enterData.srcStr = { x1: { value: class_name, addr: ctx.x1, type: "jobject" } }
                    break;
                }
            case "GetStaticIntField":
            case "GetStaticObjectField":
            case "GetFloatField":
            case "GetIntField":
            case "GetLongField":
            case "GetObjectField":
                {
                    var pJclass = this.GetObjectClass(ctx.x0, ctx.x1);
                    class_name ="";//  this.jniGetClassName(ctx.x0, pJclass);
                    var method_name = this.getJObjectToString(ctx.x0, ctx.x1);
                    var field = this.MethodIDs[ctx.x2];
                    if (field != null) {
                        method_name = field.method_name;
                        enterData.sig = field.sig;
                    }
                    //fKLog.kCLog({ jni_name, method: field })
                    //fKLog.kCLog({ jni_name, fieldclass: this.getJObjectToString(ctx.x2) })
                    enterData.srcStr = {
                        x1: { value: class_name, addr: ctx.x1, size: class_name.length },
                        x2: { value: method_name, addr: ctx.x2, size: method_name.length }
                    };

                }
                break;
            case "GetMethodID"://jmethodID GetMethodID(JNIEnv *env, jclass clazz, const char *name, const char *sig);
            case "GetStaticMethodID":
            case "GetFieldID"://jfieldID GetFieldID(JNIEnv *env, jclass clazz, const char *name, const char *sig);
            case "GetStaticFieldID":
                class_name = this.jniGetClassName(ctx.x0, ctx.x1);
                var fname = ctx.x2.readCString()
                var sig = ctx.x3.readCString();
                enterData.srcStr =
                {
                    x1: { value: class_name, addr: ctx.x1, size: class_name.length },
                    x2: { value: fname, addr: ctx.x2, size: fname.length },
                    x3: { value: sig, addr: ctx.x3, size: sig.length }
                };

                // fKLog.kCLog({ jni_name, srcStr: enterData.srcStr })
                break;
            case "CallStaticObjectMethod":
            case "CallStaticObjectMethodA":
            case "CallStaticObjectMethodV":
                {
                    var pJclass = this.GetObjectClass(ctx.x0, ctx.x1);
                    enterData.class_name =  this.jniGetClassName(ctx.x0, ctx.x1);
                    enterData.method_name = prettyMethod(ctx.x2, 1);
                    //fKLog.kCLog(enterData);
                    var sig = "";
                    var param = "";
                    sig = this.parseMethodSignature(enterData.method_name);
                    param = this.getArgsInfo(ctx.x0, ctx.x1, ctx.x2, ctx.x3, 1, false);
                    enterData.srcStr =
                    {
                        x1: { value: enterData.class_name, addr: ctx.x1 },
                        x2: { value: enterData.method_name, addr: ctx.x2 },
                        param
                    }
                    enterData.sig = sig;
                    break;
                }

            case "CallNonvirtualVoidMethodV":
            case "CallNonvirtualVoidMethodA":
            case "CallNonvirtualVoidMethod":
            //{
            //    enterData.obj_class_name = this.jniGetClassName(ctx.x0, ctx.x1);
            //    enterData.class_name = this.jniGetClassName(ctx.x0, ctx.x2);//jclass
            //    enterData.method_name = prettyMethod(ctx.x3, 1);//jmethodID

            //    enterData.srcStr =
            //    {
            //        x1: { value: enterData.class_name, addr: ctx.x1 },
            //        x2: { value: enterData.class_name, addr: ctx.x2 },
            //        x3: { value: enterData.method_name, addr: ctx.x3 }
            //    }
            //    break;
            //}
            case "CallVoidMethod":
            case "CallVoidMethodA":
            case "CallVoidMethodV":
            case "CallLongMethod":
            case "CallLongMethodA":
            case "CallLongMethodV":
            case "CallIntMethod":
            case "CallIntMethodA":
            case "CallIntMethodV":
            case "CallBooleanMethod":
            case "CallBooleanMethodA":
            case "CallBooleanMethodV":
            case "CallStaticLongMethodA":
            case "CallFloatMethodA":
            case "CallDoubleMethodA":
            case "CallStaticVoidMethodV":
            case "CallStaticVoidMethodA":
            case "CallStaticIntMethodA":
                {
                    var pJclass = this.GetObjectClass(ctx.x0, ctx.x1);
                    enterData.class_name = this.jniGetClassName(ctx.x0, pJclass);
                    enterData.method_name = prettyMethod(ctx.x2, 1);

                    var param = null;
                    param = this.getArgsInfo(ctx.x0, ctx.x1, ctx.x2, ctx.x3, 1, true)
                    enterData.srcStr =
                    {
                        x1: { value: enterData.class_name, addr: ctx.x1 },
                        x2: { value: enterData.method_name, addr: ctx.x2 },
                        param
                    }
                    break;
                }
            case "CallObjectMethod":
            case "CallObjectMethodA":
            case "CallObjectMethodV":
                {
                    var pJclass = this.GetObjectClass(ctx.x0, ctx.x1);
                    enterData.class_name = this.jniGetClassName(ctx.x0, pJclass);
                    enterData.method_name = prettyMethod(ctx.x2, 1);
                    var sig = "";
                    var param = "";
                     sig=this.parseMethodSignature(enterData.method_name);
                    param = this.getArgsInfo(ctx.x0, ctx.x1, ctx.x2, ctx.x3, 0, false);
                    enterData.srcStr =
                    {
                        x1: { value: enterData.class_name, addr: ctx.x1 },
                        x2: { value: enterData.method_name, addr: ctx.x2 },
                        param
                    }

                    enterData.sig = sig;
                    break;
                }
            case "RegisterNatives":
                var methods_ptr = ptr(ctx.x2);
                var method_count = parseInt(ctx.x3);

                class_name = this.jniGetClassName(ctx.x0, ctx.x1);

                var srcStr = [{ name: "x1", value: class_name, addr: ctx.x1 }, { name: "x3", value: ctx.x3.readCString(), addr: ctx.x3 }];
                for (var i = 0; i < method_count; i++) {
                    var name_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3));
                    var sig_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize));
                    var fnPtr_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize * 2));

                    var name = Memory.readCString(name_ptr);
                    var sig = Memory.readCString(sig_ptr);
                    srcStr.push({ name: "x2", value: name + "(" + sig + ")", addr: fnPtr_ptr });
                }
                enterData.srcStr = srcStr;
                break;
            case "FindClass":
                {
                    enterData.class_name = ctx.x1.readCString();
                    enterData.srcStr = {
                        x1: { value: enterData.class_name, addr: ctx.x1, size: enterData.class_name.length }
                    }
                    break;
                }
            case "NewStringUTF":
                {
                    enterData.srcStr = {
                        x1: { value: ctx.x1.readCString(), addr: ctx.x1 }
                    }
                    break;
                }
            case "NewString":
                {
                    enterData.srcStr = {
                        x1: { value: ctx.x1.readUtf16String(), addr: ctx.x1 }
                    }
                    break;
                }
                break;
            case "SetByteArrayRegion":
                {
                    var jValue = this.readJBytePointer(ctx.x4, parseInt(ctx.x3), false);
                    enterData.srcStr =
                    {
                        x1: { addr: ctx.x1, pname: "array" },
                        x2: { value: ctx.x2, pname: "start" },
                        x3: { value: ctx.x3, pname: "len" },
                        x4: { value: jValue, addr: ctx.x4, pname: "buf" }
                    }
                    enterData.class_handle = ctx.x1;
                    enterData.ctx = ctx;
                    break;
                }
            case "SetDoubleArrayRegion":
                {
                    var jValue = this.readJDoublePointer(ctx.x4, parseInt(ctx.x3));
                    enterData.srcStr =
                    {
                        x1: { addr: ctx.x1, pname: "array" },
                        x2: { value: ctx.x2, pname: "start" },
                        x3: { value: ctx.x3, pname: "len" },
                        x4: { value: jValue, addr: ctx.x4, pname: "buf" }
                    }
                    enterData.class_handle = ctx.x1;
                    enterData.ctx = ctx;
                    break;
                }
            case "SetFloatArrayRegion":
                {
                    var jValue = this.readJFloatPointer(ctx.x4, parseInt(ctx.x3));
                    enterData.srcStr =
                    {
                        x1: { addr: ctx.x1, pname: "array" },
                        x2: { value: ctx.x2, pname: "start" },
                        x3: { value: ctx.x3, pname: "len" },
                        x4: { value: jValue, addr: ctx.x4, pname: "buf" }
                    }
                    enterData.class_handle = ctx.x1;
                    enterData.ctx = ctx;
                    break;
                }
            case "SetIntArrayRegion":
                {
                    var jValue = this.readJIntPointer(ctx.x4, parseInt(ctx.x3));
                    enterData.srcStr =
                    {
                        x1: { addr: ctx.x1, pname: "array" },
                        x2: { value: ctx.x2, pname: "start" },
                        x3: { value: ctx.x3, pname: "len" },
                        x4: { value: jValue, addr: ctx.x4, pname: "buf" }
                    }
                    enterData.class_handle = ctx.x1;
                    enterData.ctx = ctx;
                    break;
                }
            case "GetObjectArrayElement":
            case "GetByteArrayElements":
            case "GetIntArrayElements":
            case "GetFloatArrayElements":
                {
                    enterData.srcStr = {
                        x1: { addr: ctx.x1, pname: "array" }, x2: { value: ctx.x2, pname: "iscopy" }
                    }
                    enterData.class_handle = ctx.x1;
                    enterData.ctx = ctx;
                    break;
                    break;
                }
            case "GetArrayLength":
            case "NewByteArray":
            case "NewIntArray":
            case "NewFloatArray":
            case "GetJavaVM":
            case "NewObject":
            case "NewObjectA":
            case "NewObjectV":
            case "NewLocalRef":
            case "NewGlobalRef":
                {
                    enterData.srcStr = {
                        x1: { addr: ctx.x1 }, x2: { value: ctx.x2 }, x3: { value: ctx.x3 }
                    }
                    enterData.class_handle = ctx.x1;
                    enterData.ctx = ctx;
                    break;
                }
            default:
                enterData.srcStr = {
                    x1: { addr: ctx.x1 }, x2: { value: ctx.x2 }, x3: { value: ctx.x3 }
                }
                break;
        }
        if (this.jni_context[getCTid()] == null)
            this.jni_context[getCTid()] = {};
        this.jni_context[getCTid()][jni_name] = enterData;
    }
    this.Leave = function (jni_name, ctx, retval) {
        if (this.jni_context[getCTid()] == null)
            return null;
        var enterData = this.jni_context[getCTid()][jni_name];
        if (enterData == null) {
            fKLog.kCLog("jni " + jni_name + " is null");
            return null;
        } 
        // fKLog.kCLog({ jni_name, retval, evnet: "onleave" })
        var log = {
            jni_name: jni_name, srcStr: enterData.srcStr,
            result_x0: ctx.x0, show: true
        };
        switch (jni_name) {

            case "GetObjectField":
            case "GetStaticObjectField":
                {
                    if (retval != 0 && enterData.sig != null) {
                        var retstr = this.parseJniReturn(enterData.ctx.x0, ptr(retval), enterData.sig)
                        log.result = { Addr: retval, value: retstr.value }
                    }
                    break;
                }
            case "GetStaticIntField":
            case "GetLongField":
            case "GetIntField":
                {
                    break;
                }
            case "GetMethodID":
            case "GetStaticMethodID":
                {
                    //fKLog.kCLog({ name: jni_name, msg: "leve 111111", retval })
                    var clss_name = "";// prettyMethod(retval, 1);
                    //fKLog.kCLog({ name: jni_name, msg: "leve 1111112" })
                    log.result = { Addr: retval, clss_name: clss_name }

                    this.MethodIDs[retval] = { clss_name, method_name: enterData.srcStr.x1.value, sig: enterData.srcStr.x2.value };
                    break;
                }
            case "GetFieldID":
            case "GetStaticFieldID":
                {
                    log.result = { Addr: retval }

                    this.MethodIDs[retval] = { clss_name: "", method_name: enterData.srcStr.x1.value, sig: enterData.srcStr.x2.value };
                }
                break;
            case "GetObjectClass":
                {
                    var class_name = this.jniGetClassName(enterData.ctx.x0, retval);
                    log.result = { Addr: retval, clss_name: class_name }

                    log.srcStr.x1.value = class_name;
                    log.show = false;
                    break;
                }
            case "FindClass":
                break;
            case "CallObjectMethodA":
            case "CallObjectMethodV":
            case "CallObjectMethod":
            case "CallStaticObjectMethod":
            case "CallStaticObjectMethodA":
            case "CallStaticObjectMethodV":
                {
                    if (retval != 0 && enterData.sig != null) {
                        //fKLog.kCLog({ name: "CallObjectMethodsig", sig: enterData.sig })
                        var retstr = this.parseJniReturn(enterData.ctx.x0, ptr(retval), enterData.sig.rawReturn)
                        log.result = { Addr: retval, value: retstr.value }

                        //log.sig = enterData.sig;
                    }
                    break;
                }
            case "CallStaticVoidMethodA":
            case "CallStaticIntMethodA":
            case "CallStaticLongMethodA":
            case "CallStaticVoidMethodV":
            case "CallNonvirtualVoidMethodV":
            case "CallNonvirtualVoidMethodA":
            case "CallNonvirtualVoidMethod":
            case "CallVoidMethodA":
            case "CallVoidMethodV":
            case "CallVoidMethod":
            case "CallBooleanMethodA":
            case "CallBooleanMethodV":
            case "CallBooleanMethod":
            case "CallLongMethodA":
            case "CallLongMethodV":
            case "CallLongMethod":
            case "CallIntMethodA":
            case "CallIntMethodV":
            case "CallIntMethod":
            case "NewStringUTF":
            case "NewString":
                {

                }
                break;
            case "GetFloatField":
            case "CallFloatMethodA":
                var retstr = this.parseJniReturn(enterData.ctx.x0, retval, "float");
                log.result = { Addr: retval, value: retstr.value }

                break;
            case "CallDoubleMethodA":
                var retstr = this.parseJniReturn(enterData.ctx.x0, retval, "double");
                log.result = { Addr: retval, value: retstr.value }

                break;
            case "GetStringUTFChars":
                {
                    var str = Memory.readCString(ctx.x0);
                    log.result = { value: str, Addr: ctx.x0, size: str.length }

                    break;
                }
            case "GetByteArrayElements":
                {
                    var len = this.GetArrayLength(enterData.ctx.x0, enterData.ctx.x1);
                    var rlen = 256;
                    if (len < rlen)
                        rlen = len;
                    var arr = this.readJBytePointer(ctx.x0, rlen);
                    log.result = { size: len, value: fkConvert.bytesToHex(arr), str: ctx.x0.readCString(rlen), addr: ctx.x0 }
                    break;
                }
            case "GetIntArrayElements":
                {
                    var len = this.GetArrayLength(enterData.ctx.x0, enterData.ctx.x1);
                    log.result = { size: len, value: this.readJIntPointer(ctx.x0, len), addr: ctx.x0 }
                    break;
                }
            case "GetFloatArrayElements":
                {
                    var len = this.GetArrayLength(enterData.ctx.x0, enterData.ctx.x1);
                    log.result = { size: len, value: this.readJFloatPointer(ctx.x0, len), addr: ctx.x0 }
                    break;
                }
            case "GetStaticIntField":
            case "GetArrayLength":
            case "GetObjectArrayElement":
            case "SetByteArrayRegion":
            case "NewByteArray":
            case "SetFloatArrayRegion":
            case "NewIntArray":
            case "SetIntArrayRegion":
            case "NewFloatArray":
            case "GetJavaVM":
            case "NewObject":
            case "NewObjectA":
            case "NewObjectV":
            case "NewLocalRef":
            case "NewGlobalRef":
            case "IsSameObject":
            case "IsInstanceOf":
                log.show = true;
                break;
            case "ReleaseFloatArrayElements":
            case "ReleaseIntArrayElements":
            case "ExceptionCheck":
            case "DeleteGlobalRef":
            case "ReleaseByteArrayElements":
            case "ReleaseStringUTFChars":
            case "DeleteLocalRef":
            case "ExceptionClear":
            case "ExceptionOccurred":
                {
                    log = { show: false }
                    break;
                }
            default:
                {
                    log.ctx = enterData.ctx;
                    log.show = true;
                    break;
                }
        }

        return log;
    }
}
//JNILogger End