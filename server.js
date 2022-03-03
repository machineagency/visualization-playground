'use strict';

const IDENTITY_COEFFS = '1,0,0,0,1,0,0,0,1';

// modules =================================================
const express        = require('express');
const app            = express();
const bodyParser     = require('body-parser');
const path           = require('path');
const fs             = require('fs');

// configuration ===========================================
let port = process.env.PORT || 3000; // set our port
app.use(bodyParser.json()); // for parsing application/json
app.use(express.static(__dirname + '/client')); // set the static files location /public/img will be /img for users

app.listen(port, () => {
    console.log("Running on port: " + port);
    exports = module.exports = app;
});

