const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const securitySchema = new Schema({
    // id should be assigned by db. no having to predefine db or do migrations if updated via api
    securityName: { type: String, required: true, unique: true, lowercase: true},
    isin: { type: String, required: true, unique: true, lowercase: true }, // length req
    country: { type: String, required: true, lowercase: true },
    dailyPrices: [{
        endayPrice: {
            type: Number, required: true
        },
        date: {
            type: Date, required: true // , unique: true
        }
    }] // can define a child schema then say dailyPrices: pricesSchema
    // validate: passwordValidators}
});

module.exports = mongoose.model('Security', securitySchema);