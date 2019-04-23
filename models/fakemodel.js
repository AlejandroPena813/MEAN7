const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

//TODO seperate function class for validation.
let emailLengthChecker = (email) => {
    if(!email){
        return false;
    } else return !(email.length < 5 || email.length > 30); //prevent blank values
};

let validEmailChecker = (email) => {
    if(!email){
        return false;
    } else{
        // Regular expression to test for a valid e-mail
        const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return regExp.test(email);
    }
};

const emailValidators = [
    { //custom model validators
        validator: emailLengthChecker,
        message: 'E-mail must be between 5 and 30 characters.'},
    {
        validator: validEmailChecker,
        message: 'Must be a valid e-mail.'
    }
];

let usernameLengthChecker = (username) => {
    if(!username){
        return false
    } else{
        return !(username.length < 3 || username.length > 15);
    }
};

let validUsername = (username) => {
    if(!username){
        return false;
    } else{
        // Regular expression to test if username format is valid
        const regExp = new RegExp(/^[a-zA-Z0-9]+$/);
        return regExp.test(username);
    }
};

const usernameValidators = [
    {
        validator: usernameLengthChecker,
        message: 'Username must be between 3 and 15 characters.'
    },
    {
        validator: validUsername,
        message: 'Username must not have any special characters.'
    }
];

let passwordLengthChecker = (password) => {

    if(!password){
        return false;
    } else{
        return !(password.length < 8 || password.length > 35);
    }
};

let validPassword = (password) => {
    if(!password) {
        return false;
    }
    else{
        // Regular Expression to test if password is valid format
        const regExp = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/);
        return regExp.test(password);
    }
};

const passwordValidators = [
    {
        validator: passwordLengthChecker,
        message: 'Password must be between 8 and 35 characters.'
    },
    {
        validator: validPassword,
        message: 'Must have at least one upper case, lower case, special character, and number.'
    }
];
///Validators must go above schema

const userSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, validate: emailValidators},
    username: { type: String, required: true, unique: true, lowercase: true, validate: usernameValidators},
    password: { type: String, required: true, validate: passwordValidators}
});

//middleware for mongoose pipeleine
userSchema.pre('save', function(next) {//no fat arrow nota. bc not supported
    if(!this.isModified('password'))
        return next();

    bcrypt.hash(this.password, null, null, (err, hash) => {
        if(err) return next(err);

        this.password = hash;// becoming hashed version of password in DB.
        next();
    });
});

//creating a schema method for checking unencrypted password value - login
userSchema.methods.comparePassword = (password) => {
    return bcrypt.compareSync(password, this.password); //right hand one is from DB. returns T or F
};

module.exports = mongoose.model('User', userSchema);