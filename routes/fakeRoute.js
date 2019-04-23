const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
//todo pay close attention to the shared auth routes of module.exports vs og way. notes in prev project

module.exports = (router) => {

    router.post('/register', (req, res) => {
        if(!req.body.email){
            return res.status(400).json({success: false, message: 'You must provide an e-mail to register.'});
        }
        else if(!req.body.username){
            return res.status(400).json({success: false, message: 'You must provide a username to register.'});
        }
        else if(!req.body.password){
            return res.status(400).json({success: false, message: 'You must provide a password to register.'});
        }
        else{
            console.log(req.body);

            let user = new User({
                email: req.body.email.toLowerCase(),
                username: req.body.username.toLowerCase(),
                password: req.body.password
            });
            user.save((err) => {
                if(err) {

                    if(err.code === 11000){
                        // res.json({ success: false, message: 'Username or e-mail already exists'});
                        return res.status(400).json({message: 'Username or e-mail already exists'});
                    }else {

                        if(err.errors){
                            if(err.errors.email) {
                                // res.json({success: false, message: err.errors.email.message}); //this ensures you use custom val messages
                                return res.status(err.statusCode).json({message: err.errors.email.message});
                            } else if(err.errors.username){
                                // res.json({success: false, message: err.errors.username.message});
                                return res.status(err.statusCode).json({message: err.errors.username.message});
                            } else if(err.errors.password){
                                // res.json({success: false, message: err.errors.password.message});
                                return res.status(err.statusCode).json({message: err.errors.password.message});
                            } else{
                                // res.json({ success: false, message: err}); //todo proper catch all here && modular functions for errors?
                                return res.status(err.statusCode).json({message: err});
                            }
                        }else{
                            // res.json({ success: false, message: 'Could not save user. Error: ', err});
                            return res.status(err.statusCode).json({message: 'Could not save user. Error: ', err});
                        }

                    }

                } else{
                    // res.json({ success: true, message: 'Successfully saved user.'})
                    return res.status(200).json({message: 'Successfully saved user.'});
                }
            })
        }
    });

    router.get('/checkUserName/:username', (req, res) => {
        if(!req.params.username)
            return res.status(400).json({message: 'Must provide a username'});

        User.findOne({ username: req.params.username }, (err, user) => {
            if (err) {
                return res.status(500).json({ message: err }); // Return connection error
            } else {
                // Check if user's e-mail is taken
                if (user) {
                    return res.status(400).json({ message: 'Username is already taken' }); // Return as taken e-mail
                } else {
                    return res.status(200).json({ message: 'Username is available' }); // Return as available e-mail
                }
            }
        });
    });

    router.get('/checkEmail/:email', (req, res) => {
        if(!req.params.email)
            return res.status(400).json({message: 'must provide a email'});

        User.findOne({ email: req.params.email }, (err, user) => {
            if (err) {
                return res.status(500).json({ message: err }); // Return connection error
            } else {
                // Check if user's e-mail is taken
                if (user) {
                    return res.status(400).json({ message: 'E-mail is already taken' }); // Return as taken e-mail
                } else {
                    return res.status(200).json({ message: 'E-mail is available' }); // Return as available e-mail
                }
            }
        });
    });

    router.post('/login', (req, res) => {
        console.log(req.body.username + ' ' + req.body.password);
        if(!req.body.username || !req.body.password)
            return res.status(400).json({ message: 'Username and Password required.'});
        User.findOne({ username: req.body.username.toLowerCase() }, (err, user) => {
            if(err)
                return res.status(500).json({message: err});
            if(!user)
                return res.status(404).json({message: 'Username not found.'});

            const validPassword = user.comparePassword(req.body.password); // custom db function on instance of db obj
            if(!validPassword)
                return res.status(401).json({message: 'Incorrect Password.'});

            //can be decrypted, so careful with whats stored.
            const token = jwt.sign({userId: user._id}, config.secret, {expiresIn: '24h'}); // secret verifies we created token, userId for user access.
            return res.status(200).json({message: 'Successfully Logged In.', token: token, user: {username: user.username} })
        })
    });

    //*Creating middleware here to get headers, this will intercept any routes below or other endpoints using this* router.
    router.use((req, res, next) => {
        const token = req.headers['authorization']; // if has headers attached goes through here
        console.log('token ' + token); // todo trouble with headers being passed in

        if(!token){
            return res.status(404).json({message: 'No Token Provided.'})
        } else{
            //uses tokens config.secret
            jwt.verify(token, config.secret, (err, decoded) => {
                if(err){
                    return res.status(500).json({message: 'Invalid Token.' + err});
                } else{
                    req.decoded = decoded;
                    next(); //continue in middleware process
                    // DIDNT UNDERSTAND BEFORE, but do now.
                    // the decoded variable attached to http pipeline req inside middleware, so subsequent routes using this* router have access.
                }
            })
        }
    });

    router.get('/profile', (req, res) => {
        User.findOne({_id: req.decoded.userId}).select('username email').exec((err, user) => { // note the ordering
            if(err) {
                return res.status(500).json({message: err});
            }
            if(!user){
                return res.status(404).json({message: 'User not found.'});
            }
            return res.status(200).json({user: user});
        });
    });

    return router;
};