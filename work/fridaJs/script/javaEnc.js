(function () {
    var N_ENCRYPT_MODE = 1
    var N_DECRYPT_MODE = 2
    function JELog(data) {
        fKLog.kALog(data)
        //fKLog.kLog(data)
    }
    Java.perform(function () {
        fKLog.kCLog("javaEnc.js init hook success")
        var secretKeySpec = Java.use('javax.crypto.spec.SecretKeySpec');
        secretKeySpec.$init.overload('[B', 'java.lang.String').implementation = function (key, algorithm) {

            var result = this.$init(key, algorithm);

            var msg = {};
            msg["class"] = "javax.crypto.spec.SecretKeySpec";
            msg["func"] = "$init";
            msg["encType"] = algorithm;

            msg["strKey"] = fkConvert.bytesToString(key);
            msg["hexKey"] = fkConvert.bytesToHex(key);
            msg["base64Key"] = fkConvert.bytesToBase64(key);
            fKLog.kALog(msg);
            return result;
        }
        secretKeySpec.$init.overload('[B', 'int', 'int', 'java.lang.String').implementation = function (key, offset, len, algorithm) {

            var result = this.$init(key, offset, len, algorithm);

            var msg = {};
            msg["class"] = "javax.crypto.spec.SecretKeySpec";
            msg["func"] = "$init";
            msg["encType"] = algorithm;

            msg["strKey"] = fkConvert.bytesToString(key);
            msg["hexKey"] = fkConvert.bytesToHex(key);
            msg["base64Key"] = fkConvert.bytesToBase64(key);
            fKLog.kALog(msg);
            return result;
        }

        var PKCS8EncodedKeySpec = Java.use('java.security.spec.PKCS8EncodedKeySpec');
        PKCS8EncodedKeySpec.$init.overload('[B').implementation = function (key) {

            var result = this.$init(key);

            var msg = {};
            msg["class"] = "javax.crypto.spec.PKCS8EncodedKeySpec";
            msg["func"] = "$init";

            msg["strKey"] = fkConvert.bytesToString(key);
            msg["hexKey"] = fkConvert.bytesToHex(key);
            msg["base64Key"] = fkConvert.bytesToBase64(key);
            JELog(msg);

            return result;
        }

        var DESKeySpec = Java.use('javax.crypto.spec.DESKeySpec');

        //DESKeySpec(byte[] key)
        DESKeySpec.$init.overload('[B').implementation = function (key) {

            var result = this.$init(key);

            var msg = {};
            msg["class"] = "javax.crypto.spec.DESKeySpec";
            msg["func"] = "$init";
            msg["encType"] = "DES";

            msg["strKey"] = fkConvert.bytesToString(key);
            msg["hexKey"] = fkConvert.bytesToHex(key);
            msg["base64Key"] = fkConvert.bytesToBase64(key);
            JELog(msg);

            return result;
        }

        DESKeySpec.$init.overload('[B', 'int').implementation = function (key, offset) {

            var result = this.$init(key, offset);

            var msg = {};
            msg["class"] = "javax.crypto.spec.DESKeySpec";
            msg["func"] = "$init";
            msg["encType"] = "DES";

            msg["strKey"] = fkConvert.bytesToString(key);
            msg["hexKey"] = fkConvert.bytesToHex(key);
            msg["base64Key"] = fkConvert.bytesToBase64(key);
            JELog(msg);

            return result;
        }

        var mac = Java.use('javax.crypto.Mac');
        //Mac getInstance(String algorithm) 
        mac.getInstance.overload('java.lang.String').implementation = function (algorithm) {
            var result = this.getInstance(algorithm);

            var msg = {};
            msg["class"] = "javax.crypto.Mac";
            msg["func"] = "getInstance";
            msg["encType"] = algorithm;
            return result;
        }

        //Mac getInstance(String algorithm, String provider) 
        mac.getInstance.overload('java.lang.String', 'java.lang.String').implementation = function (algorithm, provider) {
            var result = this.getInstance(algorithm, provider);

            var msg = {};
            msg["class"] = "javax.crypto.Mac";
            msg["func"] = "getInstance";
            msg["encType"] = algorithm;
            return result;
        }

        //Mac getInstance(String algorithm, Provider provider)
        mac.getInstance.overload('java.lang.String', 'java.security.Provider').implementation = function (algorithm, provider) {
            var result = this.getInstance(algorithm, provider);

            var msg = {};
            msg["encType"] = algorithm;
            return result;
        }

        //void init(Key key)
        mac.init.overload('java.security.Key').implementation = function (key) {
            this.init(key);

            var msg = {};
            msg["class"] = "javax.crypto.Mac";
            msg["func"] = "getInstance";
            msg["encType"] = this.getAlgorithm();

            var bytes_key = new Uint8Array(key.getEncoded());
            msg["update"] = fkConvert.bytesToString(bytes_key);
            msg["inputHex"] = fkConvert.bytesToHex(bytes_key);
            msg["inputBase64"] = fkConvert.bytesToBase64(bytes_key);
            JELog(msg);
        }

        //void init(Key key, AlgorithmParameterSpec params)
        mac.init.overload('java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function (key, params) {
            this.init(key, params);

            var msg = {};
            msg["class"] = "javax.crypto.Mac";
            msg["func"] = "getInstance";
            msg["encType"] = this.getAlgorithm();

            var bytes_key = new Uint8Array(key.getEncoded());
            msg["update"] = fkConvert.bytesToString(bytes_key);
            msg["inputHex"] = fkConvert.bytesToHex(bytes_key);
            msg["inputBase64"] = fkConvert.bytesToBase64(bytes_key);
            JELog(msg);
        }

        //void update(byte[] input)
        mac.update.overload('[B').implementation = function (input) {
            this.update(input);

            var msg = {};
            msg["class"] = "javax.crypto.Mac";
            msg["func"] = "update";
            msg["encType"] = this.getAlgorithm();
            msg["update"] = fkConvert.bytesToString(input);
            msg["inputHex"] = fkConvert.bytesToHex(input);
            msg["inputBase64"] = fkConvert.bytesToBase64(input);
            JELog(msg);
        }

        //void update(byte[] input, int inputOffset, int inputLen)
        mac.update.overload('[B', 'int', 'int').implementation = function (input, inputOffset, inputLen) {
            this.update(input, inputOffset, inputLen)

            var msg = {};
            msg["class"] = "javax.crypto.Mac";
            msg["func"] = "update";
            msg["encType"] = this.getAlgorithm();
            msg["input"] = fkConvert.bytesToString(input);
            msg["inputHex"] = fkConvert.bytesToHex(input);
            msg["inputBase64"] = fkConvert.bytesToBase64(a);
            msg["inputOffset"] = inputOffset;
            msg["inputLen"] = inputLen;
            JELog(msg);
        }

        //byte[] doFinal() 
        mac.doFinal.overload().implementation = function () {
            var result = this.doFinal();

            var msg = {};
            msg["class"] = "javax.crypto.Mac";
            msg["func"] = "doFinal";
            msg["encType"] = this.getAlgorithm();

            msg["result"] = fkConvert.bytesToString(result);
            msg["resultHex"] = fkConvert.bytesToHex(result);
            msg["resultBase64"] = fkConvert.bytesToBase64(result);
            JELog(msg);

            return result;
        }

        //byte[] doFinal(byte[] input)
        mac.doFinal.overload('[B').implementation = function (input) {
            var result = this.doFinal(input);

            var msg = {};
            msg["class"] = "javax.crypto.Mac";
            msg["func"] = "doFinal";
            msg["encType"] = this.getAlgorithm();
            msg["input"] = fkConvert.bytesToString(input);
            msg["resultHex"] = fkConvert.bytesToHex(result);
            msg["resultBase64"] = fkConvert.bytesToBase64(result);
            JELog(msg);

            return result;
        }

        //void doFinal(byte[] output, int outOffset) 
        mac.doFinal.overload('[B', 'int').implementation = function (output, outOffset) {
            this.doFinal(output, outOffset);

            var msg = {};
            msg["class"] = "javax.crypto.Mac";
            msg["func"] = "doFinal";
            msg["encType"] = this.getAlgorithm();
            msg["resultHex"] = fkConvert.bytesToHex(output);
            msg["resultBase64"] = fkConvert.bytesToBase64(output);
            msg["outOffset"] = outOffset;
            JELog(msg);

            return result;
        }

        function HookMessageDigest() {
            var secureRandom = Java.use('java.security.SecureRandom');
            secureRandom.nextBytes.overload('[B').implementation = function (input) {

                this.nextBytes(input);

                var msg = {};
                msg["class"] = "java.security.SecureRandom";
                msg["func"] = "nextBytes";
                msg["result"] = fkConvert.bytesToHex(input);
                JELog(msg);

                return;
            }

            var md = Java.use('java.security.MessageDigest');
            //MessageDigest getInstance(String algorithm)
            md.getInstance.overload('java.lang.String').implementation = function (algorithm) {
                var msg = {};
                msg["class"] = "java.security.MessageDigest";
                msg["func"] = "getInstance";
                msg["encType"] = algorithm;
                JELog(msg);

                return this.getInstance(algorithm);
            }

            //MessageDigest getInstance(String algorithm, String provider)
            md.getInstance.overload('java.lang.String', 'java.lang.String').implementation = function (algorithm, provider) {

                var msg = {};
                msg["class"] = "java.security.MessageDigest";
                msg["func"] = "getInstance";
                msg["encType"] = algorithm;
                JELog(msg);

                return this.getInstance(algorithm, provider);
            }

            //MessageDigest getInstance(String algorithm, Provider provider)
            md.getInstance.overload('java.lang.String', 'java.security.Provider').implementation = function (algorithm, provider) {

                var msg = {};
                msg["class"] = "java.security.MessageDigest";
                msg["func"] = "getInstance";
                msg["encType"] = algorithm;
                JELog(msg);

                return this.getInstance(algorithm, provider);
            }

            //void update(byte[] input)
            md.update.overload('[B').implementation = function (input) {

                if (this.getAlgorithm() == "SHA-1")
                    return this.update(input);
                var msg = {};
                msg["class"] = "java.security.MessageDigest";
                msg["func"] = "update";
                msg["encType"] = this.getAlgorithm();
                msg["input"] = fkConvert.bytesToString(input);
                msg["inputHex"] = fkConvert.bytesToHex(input);
                msg["inputBase64"] = fkConvert.bytesToBase64(input);
                JELog(msg);

                return this.update(input);
            }

            //void update(byte[] input, int offset, int len)
            md.update.overload('[B', 'int', 'int').implementation = function (input, offset, len) {

                if (this.getAlgorithm() == "SHA-1")
                    return this.update(input, offset, len);
                var msg = {};
                msg["class"] = "java.security.MessageDigest";
                msg["func"] = "update";
                msg["encType"] = this.getAlgorithm();

                msg["input"] = fkConvert.bytesToString(input);
                msg["inputHex"] = fkConvert.bytesToHex(input);
                msg["inputBase64"] = fkConvert.bytesToBase64(input);
                msg["offset"] = offset;
                msg["len"] = len;
                JELog(msg);

                return this.update(input, offset, len);
            }

            //byte[] digest()
            md.digest.overload().implementation = function () {

                if (this.getAlgorithm() == "SHA-1" || this.getAlgorithm() == "SHA1")
                    return this.digest();

                var msg = {};
                msg["class"] = "java.security.MessageDigest";
                msg["func"] = "digest1";
                msg["encType"] = this.getAlgorithm();

                var result = this.digest();

                msg["result"] = fkConvert.bytesToHex(result);
                msg["resultBase64"] = fkConvert.bytesToBase64(result);
                JELog(msg);

                return result;
            }

            //byte[] digest(byte[] input)
            md.digest.overload('[B').implementation = function (input) {

                if (this.getAlgorithm() == "SHA-1" || this.getAlgorithm() == "SHA1")
                    return this.digest(input);
                var msg = {};
                msg["class"] = "java.security.MessageDigest";
                msg["func"] = "digest2";
                msg["encType"] = this.getAlgorithm();

                var result = this.digest(input);

                msg["input"] = fkConvert.bytesToString(input);
                msg["result"] = fkConvert.bytesToHex(result);
                msg["resultBase64"] = fkConvert.bytesToBase64(result);
                JELog(msg);

                return result;
            }

            //byte[] digest(byte[] input, int offset, int len)
            md.digest.overload('[B', 'int', 'int').implementation = function (input, offset, len) {

                if (this.getAlgorithm() == "SHA-1" || this.getAlgorithm() == "SHA1")
                    return this.digest(input, offset, len);

                var msg = {};
                msg["class"] = "java.security.MessageDigest";
                msg["func"] = "digest3";
                msg["encType"] = this.getAlgorithm();

                var result = this.digest(input, offset, len);

                msg["input"] = fkConvert.bytesToString(input);
                msg["inputLen"] = len;
                msg["inputOffset"] = offset;

                msg["result"] = fkConvert.bytesToHex(result);
                msg["resultBase64"] = fkConvert.bytesToBase64(result);
                JELog(msg);

                return result;
            }


            var akecpk = Java.use('android.security.keystore2.AndroidKeyStoreECPrivateKey')
            akecpk.getEncoded.overload().implementation = function () {

                var msg = {};
                msg["class"] = "android.security.keystore2.AndroidKeyStoreECPrivateKey";
                msg["func"] = "getEncoded";
                var result = this.getEncoded();
                if (result != null) {
                    msg["resulthex"] = fkConvert.bytesToHex(result);
                    msg["resultbase64"] = fkConvert.bytesToBase64(result);
                    JELog(msg);
                }
                return null;
                //return result;
            }
            var kpg = Java.use('java.security.KeyPairGenerator');
            kpg.generateKeyPair.overload().implementation = function () {
                var privateKey = keyPair.getPrivate();
                fKLog.kCLog({ KeyPairGenerator: "KeyPairGenerator", privateKey: privateKey.getEncoded() })
            }
            var st = Java.use('java.security.KeyStore');
            st.getKey.overload('java.lang.String', '[C').implementation = function (a1, a2) {
                var msg = {};
                msg["class"] = "java.security.KeyStore";
                msg["func"] = "getKey";
                msg["a1"] = a1;
                msg["a2"] = a2;
                JELog(msg);

                return this.getKey(a1, a2);
            }

            var st = Java.use('java.security.Signature');
            st.initSign.overload('java.security.PrivateKey').implementation = function (pk) {
                var msg = {};
                msg["class"] = "java.security.Signature";
                msg["func"] = "initSign";
                msg["pk2"] = pk;
                msg["pktype"] = pk.$className;

                JELog(msg);

                //const secretKeySpec = Java.cast(pk, Java.use('android.security.keystore2.AndroidKeyStoreECPrivateKey'));
                //const encodedKey = secretKeySpec.getEncoded();

                return this.initSign(pk);
            }

            st.getInstance.overload('java.lang.String').implementation = function (algorithm) {
                var msg = {};
                msg["class"] = "java.security.MessageDigest";
                msg["func"] = "getInstance";
                msg["encType"] = algorithm;
                JELog(msg);

                return this.getInstance(algorithm);
            }
            //void update(byte[] input)
            st.update.overload('[B').implementation = function (input) {

                var msg = {};
                msg["class"] = "java.security.Signature";
                msg["func"] = "update";
                msg["input"] = fkConvert.bytesToString(input);
                msg["inputHex"] = fkConvert.bytesToHex(input);
                msg["inputBase64"] = fkConvert.bytesToBase64(input);
                JELog(msg);

                return this.update(input);
            }
            st.sign.overload().implementation = function () {

                var msg = {};
                msg["class"] = "java.security.Signature";
                msg["func"] = "sign";
                var result = this.sign();

                msg["resulthex"] = fkConvert.bytesToHex(result);
                msg["resultbase64"] = fkConvert.bytesToBase64(result);
                JELog(msg);

                //return null;
                return result;
            }
        }

        //HookMessageDigest();

        var auBase64 = Java.use('android.util.Base64');
        auBase64.encode.overload('[B', 'int').implementation = function (data, t) {

            var msg = {};
            msg["class"] = "android.util.Base64";
            msg["func"] = "encode";

            msg["input"] = fkConvert.bytesToHex(data);
            var result = this.encode(data, t);
            msg["result"] = fkConvert.bytesToString(result);

            JELog(msg);
            return result;
        }
        auBase64.decode.overload('[B', 'int').implementation = function (data, t) {

            var msg = {};
            msg["class"] = "android.util.Base64";
            msg["func"] = "decode";

            msg["input"] = fkConvert.bytesToString(data);
            var result = this.decode(data, t);
            msg["result"] = fkConvert.bytesToHex(result);

            JELog(msg);
            return result;
        }
        var keyStore = Java.use("java.security.KeyStore");
        keyStore.getEntry.overload('java.lang.String', 'java.security.KeyStore$ProtectionParameter').implementation = function (alias, protParam) {
            console.log("[*] KeyStore getEntry called for alias: " + alias);

            var entry = this.getEntry(alias, protParam);
            return entry;
        };
        keyStore.setEntry.implementation = function (key, entry, protectionParameter) {
            console.log("[*] KeyStore setEntry called for alias: " + key);
            // 调用原始的setEntry方法
            this.setEntry(key, entry, protectionParameter);
        };

        var gcmParameterSpec = Java.use('javax.crypto.spec.GCMParameterSpec');
        gcmParameterSpec.$init.overload('int', '[B').implementation = function (size, iv) {

            var msg = {};
            msg["class"] = "javax.crypto.spec.GCMParameterSpec";
            msg["func"] = "$init";

            var result = this.$init(size, iv);

            msg["IV"] = fkConvert.bytesToString(iv);
            msg["IVHex"] = fkConvert.bytesToHex(iv);

            JELog(msg);
            return result;
        }
        var ivParameterSpec = Java.use('javax.crypto.spec.IvParameterSpec');
        ivParameterSpec.$init.overload('[B').implementation = function (iv) {

            var msg = {};
            msg["class"] = "javax.crypto.spec.IvParameterSpec";
            msg["func"] = "$init";

            var result = this.$init(iv);

            msg["IV"] = fkConvert.bytesToString(iv);
            msg["IVHex"] = fkConvert.bytesToHex(iv);

            JELog(msg);
            return result;
        }
        ivParameterSpec.$init.overload('[B', 'int', 'int').implementation = function (iv, offset, len) {

            var msg = {};
            msg["class"] = "javax.crypto.spec.IvParameterSpec";
            msg["func"] = "$init";

            var result = this.$init(iv, offset, len);

            msg["IV"] = fkConvert.bytesToString(iv);
            msg["IVHex"] = fkConvert.bytesToHex(iv);
            msg["offset"] = offset;
            msg["len"] = len;

            JELog(msg);
            return result;
        }

        var cipher = Java.use('javax.crypto.Cipher');
        //getInstance(String transformation)
        cipher.getInstance.overload('java.lang.String').implementation = function (transformation) {

            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "getInstance1";

            var result = this.getInstance(transformation);
            msg["encType"] = transformation;
            JELog(msg);
            return result;
        }

        //getInstance(String transformation, String provider)
        cipher.getInstance.overload('java.lang.String', 'java.lang.String').implementation = function (transformation, provider) {

            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "getInstance2";

            var result = this.getInstance(transformation, provider);
            msg["encType"] = transformation;
            JELog(msg);
            return result;
        }

        //getInstance(String transformation, Provider provider)
        cipher.getInstance.overload('java.lang.String', 'java.security.Provider').implementation = function (transformation, provider) {

            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "getInstance";

            var result = this.getInstance(transformation, provider);
            msg["encType"] = transformation;
            JELog(msg);
            return result;
        }

        //void init(int opmode, Key key) 
        cipher.init.overload('int', 'java.security.Key').implementation = function (opmode, key) {

            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "init1";
            msg["keytype"] = key.$className;
            msg["encType"] = this.getAlgorithm();
            var result = this.init(opmode, key);

            if (N_ENCRYPT_MODE == opmode) {
                msg["opmode"] = "加密";
            }
            else if (N_DECRYPT_MODE == opmode) {
                msg["opmode"] = "解密";
            }

            var bytes_key = new Uint8Array(key.getEncoded());
            msg["strKey"] = fkConvert.bytesToString(bytes_key);
            msg["hexKey"] = fkConvert.bytesToHex(bytes_key);
            msg["base64Key"] = fkConvert.bytesToBase64(bytes_key);
            JELog(msg);
            return result;
        }

        //void init(int opmode, Key key, SecureRandom random)
        cipher.init.overload('int', 'java.security.Key', 'java.security.SecureRandom').implementation = function (opmode, key, random) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "init2";
            msg["keytype"] = key.$className;
            msg["encType"] = this.getAlgorithm();
            var result = this.init(opmode, key, random);
            if (N_ENCRYPT_MODE == opmode) {
                msg["opmode"] = "加密";
            }
            else if (N_DECRYPT_MODE == opmode) {
                msg["opmode"] = "解密";
            }

            var bytes_key = new Uint8Array(key.getEncoded());
            msg["strKey"] = fkConvert.bytesToString(bytes_key);
            msg["hexKey"] = fkConvert.bytesToHex(bytes_key);
            msg["base64Key"] = fkConvert.bytesToBase64(bytes_key);
            JELog(msg);

            return result;
        }

        //void init(int opmode, Key key, AlgorithmParameterSpec params)
        cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function (opmode, key, params) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "init3";
            msg["keytype"] = key.$className;
            msg["encType"] = this.getAlgorithm();


            var result = this.init(opmode, key, params);

            if (N_ENCRYPT_MODE == opmode) {
                msg["opmode"] = "加密";
            }
            else if (N_DECRYPT_MODE == opmode) {
                msg["opmode"] = "解密";
            }

            var bytes_key = new Uint8Array(key.getEncoded());

            msg["strKey"] = fkConvert.bytesToString(bytes_key);
            msg["hexKey"] = fkConvert.bytesToHex(bytes_key);
            msg["base64Key"] = fkConvert.bytesToBase64(bytes_key);
            JELog(msg);

            return result;
        }

        //void init(int opmode, Key key, AlgorithmParameterSpec params, SecureRandom random) 
        cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec', 'java.security.SecureRandom').implementation = function (opmode, key, params, random) {

            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "init4";
            msg["keytype"] = key.$className;
            msg["encType"] = this.getAlgorithm();

            var result = this.update(opmode, key, params, random);
            if (N_ENCRYPT_MODE == opmode) {
                msg["opmode"] = "加密";
            }
            else if (N_DECRYPT_MODE == opmode) {
                msg["opmode"] = "解密";
            }

            var bytes_key = new Uint8Array(key.getEncoded());

            msg["strKey"] = fkConvert.bytesToString(bytes_key);
            msg["hexKey"] = fkConvert.bytesToHex(bytes_key);
            msg["base64Key"] = fkConvert.bytesToBase64(bytes_key);
            JELog(msg);

            return result;
        }

        //void init(int opmode, Key key, AlgorithmParameters params) 
        cipher.init.overload('int', 'java.security.Key', 'java.security.AlgorithmParameters').implementation = function (opmode, key, params) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "init5";
            msg["keytype"] = key.$className;
            msg["encType"] = this.getAlgorithm();

            var result = this.init(opmode, key, params);
            if (N_ENCRYPT_MODE == opmode) {
                msg["opmode"] = "加密";
            }
            else if (N_DECRYPT_MODE == opmode) {
                msg["opmode"] = "解密";
            }

            var bytes_key = new Uint8Array(key.getEncoded());
            msg["strKey"] = fkConvert.bytesToString(bytes_key);
            msg["hexKey"] = fkConvert.bytesToHex(bytes_key);
            msg["base64Key"] = fkConvert.bytesToBase64(bytes_key);
            JELog(msg);
            return result;
        }

        //void init(int opmode, Key key, AlgorithmParameters params, SecureRandom random)
        cipher.init.overload('int', 'java.security.Key', 'java.security.AlgorithmParameters', 'java.security.SecureRandom').implementation = function (opmode, key, params, random) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "init6";
            msg["keytype"] = key.$className;
            msg["encType"] = this.getAlgorithm();

            var result = this.init(opmode, key, params, random);
            if (N_ENCRYPT_MODE == opmode) {
                msg["opmode"] = "加密";
            }
            else if (N_DECRYPT_MODE == opmode) {
                msg["opmode"] = "解密";
            }

            var bytes_key = new Uint8Array(key.getEncoded());
            msg["strKey"] = fkConvert.bytesToString(bytes_key);
            msg["hexKey"] = fkConvert.bytesToHex(bytes_key);
            msg["base64Key"] = fkConvert.bytesToBase64(bytes_key);
            JELog(msg);

            return result;
        }

        //void init(int opmode, Certificate certificate)
        cipher.init.overload('int', 'java.security.cert.Certificate').implementation = function (opmode, certificate) {

            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "init7";
            msg["encType"] = this.getAlgorithm();

            var result = this.init(opmode, certificate);

            if (N_ENCRYPT_MODE == opmode) {
                msg["opmode"] = "加密";
            }
            else if (N_DECRYPT_MODE == opmode) {
                msg["opmode"] = "解密";
            }

            JELog(msg);
            return result;
        }

        //void init(int opmode, Certificate certificate, SecureRandom random)
        cipher.init.overload('int', 'java.security.cert.Certificate', 'java.security.SecureRandom').implementation = function (opmode, certificate, random) {

            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "init8";
            msg["encType"] = this.getAlgorithm();

            var result = this.init(opmode, certificate, random);
            if (N_ENCRYPT_MODE == opmode) {
                msg["opmode"] = "加密";
            }
            else if (N_DECRYPT_MODE == opmode) {
                msg["opmode"] = "解密";
            }

            JELog(msg);
            return result;
        }

        //byte[] update(byte[] input)
        cipher.update.overload('[B').implementation = function (input) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "update";
            msg["encType"] = this.getAlgorithm();

            var result = this.update(input);

            msg["input"] = fkConvert.bytesToString(input);
            msg["inputHex"] = fkConvert.bytesToHex(input);
            msg["inputBase64"] = fkConvert.bytesToBase64(input);

            JELog(msg);

            return result;
        }
        //byte[] update(byte[] input, int inputOffset, int inputLen)
        cipher.update.overload('[B', 'int', 'int').implementation = function (input, inputOffset, inputLen) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "update";
            msg["encType"] = this.getAlgorithm();

            var result = this.update(input, inputOffset, inputLen);

            msg["input"] = fkConvert.bytesToString(input);
            msg["inputHex"] = fkConvert.bytesToHex(input);
            msg["inputBase64"] = fkConvert.bytesToBase64(input);

            msg["inputOffset"] = inputOffset;
            msg["inputLen"] = inputLen;

            JELog(msg);
            return result;
        }
        //int update(byte[] input, int inputOffset, int inputLen, byte[] output) 
        cipher.update.overload('[B', 'int', 'int', '[B').implementation = function (input, inputOffset, inputLen, output) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "update";
            msg["encType"] = this.getAlgorithm();

            var result = this.update(input, inputOffset, inputLen, output);

            msg["input"] = fkConvert.bytesToString(input);
            msg["inputHex"] = fkConvert.bytesToHex(input);
            msg["inputBase64"] = fkConvert.bytesToBase64(input);

            msg["inputOffset"] = inputOffset;
            msg["inputLen"] = inputLen;

            JELog(msg);
            return result;
        }
        //int update(byte[] input, int inputOffset, int inputLen, byte[] output, int outputOffset)
        cipher.update.overload('[B', 'int', 'int', '[B', 'int').implementation = function (input, inputOffset, inputLen, output, outputOffset) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "update";
            msg["encType"] = this.getAlgorithm();

            var result = this.update(input, inputOffset, inputLen, output, outputOffset);

            msg["input"] = fkConvert.bytesToString(input);
            msg["inputHex"] = fkConvert.bytesToHex(input);
            msg["inputBase64"] = fkConvert.bytesToBase64(input);

            msg["inputOffset"] = inputOffset;
            msg["inputLen"] = inputLen;

            JELog(msg);
            return result;
        }

        //byte[] doFinal()
        cipher.doFinal.overload().implementation = function () {

            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "doFinal1";
            msg["encType"] = this.getAlgorithm();

            var result = this.doFinal();
            msg["result"] = fkConvert.bytesToString(result);
            msg["resultHex"] = fkConvert.bytesToHex(result);
            msg["resultBase64"] = fkConvert.bytesToBase64(result);

            JELog(msg);
            return result;
        }
        //int doFinal(byte[] output, int outputOffset)
        cipher.doFinal.overload('[B', 'int').implementation = function (output, outputOffset) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "doFinal2";
            msg["encType"] = this.getAlgorithm();

            var result = this.doFinal(output, outputOffset);

            msg["result"] = fkConvert.bytesToString(output);
            msg["resultHex"] = fkConvert.bytesToHex(output);
            msg["resultBase64"] = fkConvert.bytesToBase64(output);

            msg["outputOffset"] = outputOffset;
            msg["outputLen"] = result;


            JELog(msg);

            return result;
        }
        //byte[] doFinal(byte[] input) 
        cipher.doFinal.overload('[B').implementation = function (input) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "doFinal3";
            msg["encType"] = this.getAlgorithm();

            var result = this.doFinal(input);

            msg["input"] = fkConvert.bytesToHex(input);
            msg["result"] = fkConvert.bytesToString(result);
            msg["resultHex"] = fkConvert.bytesToHex(result);
            msg["resultBase64"] = fkConvert.bytesToBase64(result);

            JELog(msg);

            return result;
        }
        //byte[] doFinal(byte[] input, int inputOffset, int inputLen)
        cipher.doFinal.overload('[B', 'int', 'int').implementation = function (input, inputOffset, inputLen) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "doFinal4";
            msg["encType"] = this.getAlgorithm();

            var result = this.doFinal(input, inputOffset, inputLen);

            msg["result"] = fkConvert.bytesToString(result);
            msg["resultHex"] = fkConvert.bytesToHex(result);
            msg["resultBase64"] = fkConvert.bytesToBase64(result);

            msg["input"] = fkConvert.bytesToString(input);
            msg["InOffset"] = inputOffset;
            msg["InputLen"] = inputLen;


            JELog(msg);

            return result;
        }
        //int doFinal(byte[] input, int inputOffset, int inputLen, byte[] output) 
        cipher.doFinal.overload('[B', 'int', 'int', '[B').implementation = function (input, inputOffset, inputLen, output) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "doFinal5";
            msg["encType"] = this.getAlgorithm();

            var result = this.doFinal(input, inputOffset, inputLen, output);

            msg["input"] = fkConvert.bytesToString(input);
            msg["result"] = fkConvert.bytesToString(output);
            msg["resultHex"] = fkConvert.bytesToHex(output);
            msg["resultBase64"] = fkConvert.bytesToBase64(output);

            msg["InOffset"] = inputOffset;
            msg["InputLen"] = inputLen;

            msg["outputOffset"] = 0;
            msg["outputLen"] = result;


            JELog(msg);

            return result;
        }
        //int doFinal(byte[] input, int inputOffset, int inputLen, byte[] output, int outputOffset)
        cipher.doFinal.overload('[B', 'int', 'int', '[B', 'int').implementation = function (input, inputOffset, inputLen, output, outputOffset) {
            var msg = {};
            msg["class"] = "javax.crypto.Cipher";
            msg["func"] = "doFinal6";
            msg["encType"] = this.getAlgorithm();

            var result = this.doFinal(input, inputOffset, inputLen, output, outputOffset);

            msg["input"] = fkConvert.bytesToString(input);
            msg["result"] = fkConvert.bytesToString(output);
            msg["resultHex"] = fkConvert.bytesToHex(output);
            msg["resultBase64"] = fkConvert.bytesToBase64(output);

            msg["InOffset"] = inputOffset;
            msg["InputLen"] = inputLen;

            msg["outputOffset"] = outputOffset;
            msg["outputLen"] = result;


            JELog(msg);

            return result;
        }

        var x509EncodedKeySpec = Java.use('java.security.spec.X509EncodedKeySpec');
        x509EncodedKeySpec.$init.overload('[B').implementation = function (a) {
            var msg = {};
            msg["class"] = "java.security.spec.X509EncodedKeySpec";
            msg["func"] = "$init";

            var result = this.$init(a);
            msg["rsaKey"] = fkConvert.bytesToBase64(a);
            msg["encType"] = "rsa";
            JELog(msg);

            return result;
        }

        var rSAPublicKeySpec = Java.use('java.security.spec.RSAPublicKeySpec');
        rSAPublicKeySpec.$init.overload('java.math.BigInteger', 'java.math.BigInteger').implementation = function (a, b) {
            var msg = {};
            msg["class"] = "java.security.spec.RSAPublicKeySpec";
            msg["func"] = "$init";

            var result = this.$init(a, b);

            msg["rsaKeyN"] = a.toString(16);
            msg["rsaKeyE"] = b.toString(16);
            msg["encType"] = "rsa";
            JELog(msg);
            return result;
        }

        var KeyPairGenerator = Java.use('java.security.KeyPairGenerator');
        KeyPairGenerator.generateKeyPair.implementation = function () {
            var msg = {};
            msg["class"] = "java.security.KeyPairGenerator";
            msg["func"] = "generateKeyPair";
            msg["encType"] = this.getAlgorithm();

            var result = this.generateKeyPair();
            var str_private = result.getPrivate().getEncoded();
            var str_public = result.getPublic().getEncoded();

            msg["PubKey"] = fkConvert.bytesToHex(str_public);
            msg["PriKey"] = fkConvert.bytesToHex(str_private);
            JELog(msg);
            return result;
        }

        KeyPairGenerator.genKeyPair.implementation = function () {
            var msg = {};
            msg["class"] = "java.security.KeyPairGenerator";
            msg["func"] = "genKeyPair";
            msg["encType"] = this.getAlgorithm();

            var result = this.genKeyPair();

            var str_private = result.getPrivate().getEncoded();
            var str_public = result.getPublic().getEncoded();

            msg["PubKey"] = fkConvert.bytesToHex(str_public);
            msg["PriKey"] = fkConvert.bytesToHex(str_private);
            JELog(msg);

            return result;
        }
    });
})();