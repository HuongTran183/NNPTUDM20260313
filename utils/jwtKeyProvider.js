let fs = require('fs')
let path = require('path')

function normalizeKey(raw) {
    if (!raw) {
        return '';
    }
    return raw.replace(/\\n/g, '\n').trim();
}

function readFromFile(fileName) {
    let fullPath = path.join(__dirname, '..', 'keys', fileName);
    if (!fs.existsSync(fullPath)) {
        return null;
    }
    return fs.readFileSync(fullPath, 'utf8').trim();
}

function readFromEnv(plainEnvName, base64EnvName) {
    if (process.env[plainEnvName]) {
        return normalizeKey(process.env[plainEnvName]);
    }

    if (process.env[base64EnvName]) {
        return Buffer.from(process.env[base64EnvName], 'base64').toString('utf8').trim();
    }

    return null;
}

function ensureKey(key, missingMessage) {
    if (!key) {
        throw new Error(missingMessage);
    }
    return key;
}

module.exports = {
    getPrivateKey: function () {
        let key = readFromEnv('JWT_PRIVATE_KEY', 'JWT_PRIVATE_KEY_BASE64') || readFromFile('private.key');
        return ensureKey(
            key,
            'Missing RSA private key. Set JWT_PRIVATE_KEY/JWT_PRIVATE_KEY_BASE64 or create keys/private.key'
        );
    },
    getPublicKey: function () {
        let key = readFromEnv('JWT_PUBLIC_KEY', 'JWT_PUBLIC_KEY_BASE64') || readFromFile('public.key');
        return ensureKey(
            key,
            'Missing RSA public key. Set JWT_PUBLIC_KEY/JWT_PUBLIC_KEY_BASE64 or create keys/public.key'
        );
    }
}
