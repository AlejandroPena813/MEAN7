const Security = require('../models/security');

module.exports = (router) => {

    router.post('/newSecurity', (req, res) => {
        if(!req.body.securityName){
            return res.status(400).json({success: false, message: 'You must provide a security name.'});
        }
        else if(!req.body.isin){
            return res.status(400).json({success: false, message: 'You must provide an ISIN.'});
        }
        else if(!req.body.country){
            return res.status(400).json({success: false, message: 'You must provide a country.'});
        }
        else{
            console.log(req.body);

            let security = new Security({
                securityName: req.body.securityName.toLowerCase(),
                isin: req.body.isin.toLowerCase(),
                country: req.body.country.toLowerCase(),
                dailyPrices: []
            });
            security.save((err) => {
                if(err) {

                    if(err.code === 11000){
                        // res.json({ success: false, message: 'Username or e-mail already exists'});
                        return res.status(400).json({message: 'Security already exists.'});
                    }else {

                        if(err.errors){
                            if(err.errors.securityName) {
                                // res.json({success: false, message: err.errors.email.message}); //this ensures you use custom val messages
                                return res.status(err.statusCode).json({message: err.errors.securityName.message});
                            } else if(err.errors.isin){
                                // res.json({success: false, message: err.errors.username.message});
                                return res.status(err.statusCode).json({message: err.errors.isin.message});
                            } else if(err.errors.country){
                                // res.json({success: false, message: err.errors.password.message});
                                return res.status(err.statusCode).json({message: err.errors.country.message});
                            } else{
                                // res.json({ success: false, message: err}); //todo proper catch all here && modular functions for errors?
                                return res.status(err.statusCode).json({message: err});
                            }
                        }else{
                            // res.json({ success: false, message: 'Could not save user. Error: ', err});
                            return res.status(err.statusCode).json({message: 'Could not save security. Error: ', err});
                        }

                    }

                } else{
                    // res.json({ success: true, message: 'Successfully saved user.'})
                    return res.status(200).json({message: 'Successfully saved security.'});
                }
            })
        }
        // return res.status(200).json({message: 'Succesfully targeted POST'});
    });

        return router;
};