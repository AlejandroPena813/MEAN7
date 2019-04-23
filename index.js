const express = require('express');
const app = express();
const router = express.Router();

const mongoose = require('mongoose');
const config  = require('./config/database'); //importing module.exports of DB
const security = require('./routes/security')(router); //passing it in this way is to share
const bodyParser = require('body-parser');//acts as middleware to translate json
const cors = require('cors');

mongoose.Promise = global.Promise;//mongoose config
mongoose.connect(config.uri, {useNewUrlParser: true}, (err) => {
    if(err) {
        console.log('Could NOT connect to database: ', err);
    } else{
        console.log('Could connect to database: ', config.db);
    }
});

app.use(cors({ //once prd both running off same domain, so wont be needed.
    origin: 'http://localhost:4200' //restrict access from origin url domain only
}));
app.use(bodyParser.urlencoded({ extended: false}));//middleware for json deserialization and into model. application/c-www-form-urlencoded accepted
app.use(bodyParser.json());

app.use(express.static(__dirname + '/client/dist/'));// TODO prod only
app.use('/api/security', security);

app.get( '*', (req, res) => {
    res.send('<h1>Page not found.</h1>');
    // todo? res.sendFile(path.join(__dirname + '/client/dist/index/html')); //prod
});

app.listen(8080, () => {
    console.log('Listening on port 8080');
});