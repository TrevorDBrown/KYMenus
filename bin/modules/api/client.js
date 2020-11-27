"use strict";
/*
    KYMenus
    (c)2020 Trevor D. Brown. All rights reserved.
    
    client.ts - the client API for the service.
*/
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
app.get('/', function (req, res) {
    res.status(200).send("Hello world!");
});
// /api/getRestuarants - 
app.get('/api/getRestaurants', function (req, res) {
});
app.listen(3000, function () {
    console.log("KYMenus is running on port 3000.");
});
