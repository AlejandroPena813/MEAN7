const express = require('express');
const app = express();

app.get( '/', (req, res) => {
    res.send('<h1>hello world</h1>');
});
app.get( '*', (req, res) => {
    res.send('<h1>default for all routes</h1>');
});

app.listen(8080, () => {
    console.log('Listening on port 8080');
});