/*
    KYMenus
    (c)2020 Trevor D. Brown. All rights reserved.
    
    client.ts - the client API for the service.
*/

import express = require('express');
const app: express.Application = express();

// / - the Base URL for the site. Making a GET request to this endpoint results in the homepage of the site being sent.
app.get('/', (req, res) => {
    res.status(200).send("Hello world!");
});

// api - the API Base URL. Making a GET request to this endpoint results in a listing of all public API endpoints.
app.get('/api/', (req, res) => {
    res.status(200).send("Successful request.");
});

app.listen(3000, () => {
    console.log("KYMenus is running on port 3000.");
});