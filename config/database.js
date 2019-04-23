const crypto = require('crypto').randomBytes(256).toString('hex'); // express function

module.exports =
    {
        uri: 'mongodb://localhost:27017/mean7',
        secret: crypto,
        db: 'mean7'
    };