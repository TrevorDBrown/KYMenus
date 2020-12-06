/*
    KYMenus
    (c)2020 Trevor D. Brown. All rights reserved.
    
    client.ts - the client API for the service.
*/

import express = require('express');
const app: express.Application = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}));

import * as generalTypes from './../../types/generalTypes'
import * as dbInterface from './../db/db';

// / - the Base URL for the site. Making a GET request to this endpoint results in the homepage of the site being sent.
app.get('/', (req, res) => {
    res.status(200).send("Hello world!");
});

// api - the API Base URL. Making a GET request to this endpoint results in a listing of all public API endpoints.
app.get('/api/', (req, res) => {
    res.status(200).send("Successful request.");
});

app.get('/api/getAllRestaurants', (req, res) => {
    
    dbInterface.executeQuery("GetAllRestaurants", (requestStatus, queryResults) => {
        var response = {
            "status": requestStatus,
            "queryResponse": queryResults
        };
        
        res.status(200).send(response);
    });

});

app.get('/api/getMenusWithMenuItemsByRestaurant', (req, res) => {
    
    var requestStatus: generalTypes.Status;

    if (!req.body.restaurantPublicID){
        requestStatus = "Error";
        var response =
         {
            "status": requestStatus,
            "message": "Missing required field(s): restaurantPublicID"
        }
        res.status(400).send(response);
    }else {
        var input: string[] = [req.body.restaurantPublicID]
        dbInterface.executeQuery("GetMenusWithMenuItemsByRestaurant", (requestStatus, queryResults) => {
            var response = {
                "status": requestStatus,
                "queryResponse": queryResults
            };
            
            res.status(200).send(response);
        });
    }

});

app.listen(3000, () => {
    console.log("KYMenus is running on port 3000.");
});