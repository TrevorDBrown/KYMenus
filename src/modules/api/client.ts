/*
    KYMenus
    (c)2020-2021 Trevor D. Brown. All rights reserved.
    
    client.ts - the client API for the service.
*/

import path = require('path');
import express = require('express');
import async = require('async');
var dbModule = require('./../db/db');
var uiModule = require('./../ui/ui');
import { QueryResult } from '../../types/databaseTypes';

const app: express.Application = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}));

/*
    Static Routes (for resources)
*/
app.use('/shared/bootstrap/', express.static(path.join(__dirname, './../../../node_modules/bootstrap/dist/')));
app.use('/shared/jquery/', express.static(path.join(__dirname, './../../../node_modules/jquery/dist/')));
app.use('/shared/fontawesome/css/', express.static(path.join(__dirname, './../../../node_modules/@fortawesome/fontawesome-free/css/')));
app.use('/shared/fontawesome/webfonts/', express.static(path.join(__dirname, './../../../node_modules/@fortawesome/fontawesome-free/webfonts/')));

// KYMenus Client Interface specific routes
app.use('/css/', express.static(path.join(__dirname, './../../ui/client/css/')));
app.use('/js/', express.static(path.join(__dirname, './../../ui/client/js/')));
app.use('/images/', express.static(path.join(__dirname, './../../private/assets/user-profile/')));

/*
    KYMenus Client Interface
*/
// / - the Base URL for the site. Making a GET request to this endpoint results in the homepage of the site being sent.
app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, './../../ui/client/index.html'));
});

// /restaurants/:PublicRestaurantID - displays page for specified restaurant. Otherwise, if invalid, redirects to /restaurants.
app.get('/where-to-eat', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, './../../ui/client/where-to-eat.html'));
});

app.get('/restaurants', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, './../../ui/client/restaurants.html'));
});

app.get('/restaurants/:RestaurantPublicID', (req, res) => {
    var responseFromGenerateRestaurantPage: {status?: string, error?: string, html?: string} = uiModule.generateRestaurantPage();

    // TODO: break out api endpoint function for getting restaurant data. Create new file for data inquiry, call from endpoint for api and here...
    if (responseFromGenerateRestaurantPage.html){
        res.status(200).send(responseFromGenerateRestaurantPage.html);
    }else{
        res.status(404).send("File not found.");
    }

    //res.status(200).sendFile(path.join(__dirname, './../../ui/client/restaurant-template.html'));
});

/* 
    KYMenus API
*/
// api - the API Base URL. Making a GET request to this endpoint results in a listing of all public API endpoints.
app.get('/api/', (req, res) => {
    res.status(200).send("Successful request.");
});

app.get('/api/getAllRestaurants', (req, res) => {

    dbModule.executeQuery("GetAllRestaurants", (requestStatus: string, queryResults: QueryResult, error: Error) => {
        var response = {
            "status": requestStatus,
            "queryResponse": queryResults,
            "error": error
        };
        
        res.status(200).send(response);
    });

});

app.post('/api/getRestaurantByPublicID', (req, res) => {

    var requestStatus: string = "";

    if (!req.body.restaurantPublicID){
        let response: {status: string; error: string;} = {
            status: "Error",
            error: "Missing required field(s): restaurantPublicID"
        };

        res.status(400).send(response);
    }else {
        let response: {status: string; queryResponse: QueryResult[]; error: string};
        var input: [{field: string; value: string;}];

        async.series([
            function (callback) {
                input = [{
                    field: "RestaurantPublicID",
                    value: req.body.restaurantPublicID
                }];

                dbModule.executeQuery("GetRestaurantByRestaurantPublicID", (requestStatus: string, queryResults: QueryResult, error: Error) => {
                    if (!error){
                        response = {
                            status: "Success",
                            queryResponse: [queryResults],
                            error: ""
                        }
                        
                        callback(null);
                    }else{
                        callback(error);
                    }
                },
                input);
            },
            function (callback) {
                input = [{
                    field: "RestaurantPublicID",
                    value: req.body.restaurantPublicID
                }];

                dbModule.executeQuery("GetHoursByRestaurantPublicID", (requestStatus: string, queryResults: QueryResult, error: Error) => {
                    if (!error){
                        response.queryResponse.push(queryResults);
                        callback(null);
                    }else{
                        callback(error);
                    }
                },
                input);
            },
            function (callback) {
                input = [{
                    field: "RestaurantPublicID",
                    value: req.body.restaurantPublicID
                }];

                dbModule.executeQuery("GetMenusWithMenuItemsByRestaurantPublicID", (requestStatus: string, queryResults: QueryResult, error: Error) => {
                    if (!error){
                        response.queryResponse.push(queryResults);
                        callback(null);
                    }else{
                        callback(error);
                    }
                },
                input);
            }
        ], function(error){
            if (!error) {
                res.status(200).send(response);
            }else{
                response["status"] = "Error";
                response["error"] = error.message;
                res.status(500).send(response);
            }
        });
    }

});

app.get('/api/getMenusWithMenuItemsByRestaurant', (req, res) => {
    
    var requestStatus: string = "";

    if (!req.body.restaurantPublicID){
        requestStatus = "Error";
        var response =
         {
            "status": requestStatus,
            "message": "Missing required field(s): restaurantPublicID"
        }
        res.status(400).send(response);
    }else {
        var input: [{field: string; value: string;}] = [{
            field: "RestaurantPublicID",
            value: req.body.restaurantPublicID
        }];
        
        dbModule.executeQuery("GetMenusWithMenuItemsByRestaurant", (requestStatus: string, queryResults: QueryResult, error: Error) => {
            var response = {
                "status": requestStatus,
                "queryResponse": queryResults,
                "error": error
            };
            
            res.status(200).send(response);
        },
        input);
    }

});

app.listen(3000, () => {
    console.log("KYMenus is running on port 3000.");
});