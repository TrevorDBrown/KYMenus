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

app.get('/restaurants/:RestaurantUniqueID', (req, res) => {
    getRestaurantData(req.params.RestaurantUniqueID, (status: string, queryResponse: QueryResult[], error: string) => { 
        if (status == "Success"){
            var responseFromGenerateRestaurantPage: {status?: string, error?: string, html?: string} = uiModule.generateRestaurantPage(queryResponse);
    
            if (responseFromGenerateRestaurantPage.html){
                res.status(200).send(responseFromGenerateRestaurantPage.html);
            }else{
                res.status(404).send("File not found.");
            }
        }else{
            res.status(404).send("File not found.");
        }
    });

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
        getRestaurantData(req.body.restaurantPublicID, (status: string, queryResponse: QueryResult[], error: string) => {
            let response: {status: string, queryResponse: QueryResult[], error: string} = {
                status: status,
                queryResponse: queryResponse,
                error: error
            };

            if (status == "Success"){
                res.status(200).send(response);
            }else{
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

function getRestaurantData(restaurantUniqueID: string, callback: (status: string, queryResponse: QueryResult[], error: string) => void): void {
    let response: {status: string; queryResponse: QueryResult[]; error: string};
    var input: [{field: string; value: string;}];
    var restaurantPublicID: string = "";

    async.series([
        function (callback) {
            input = [{
                field: "RestaurantPublicID",
                value: restaurantUniqueID
            }];

            dbModule.executeQuery("GetRestaurantByRestaurantPublicID", (requestStatus: string, queryResults: QueryResult, error: Error) => {
                if (!error){
                    // TODO: implement better error handling here.
                    if (queryResults.queryResults && queryResults.queryResults.length > 0){
                        response = {
                            status: "Success",
                            queryResponse: [queryResults],
                            error: ""
                        };

                        restaurantPublicID = restaurantUniqueID;
                        
                        callback(null); 
                    }else{
                        input = [{
                            field: "RestaurantShorthand",
                            value: restaurantUniqueID
                        }];

                        dbModule.executeQuery("GetRestaurantByRestaurantShorthand", (requestStatus: string, queryResults: QueryResult, error: Error) => { 
                            if (!error){
                                if (queryResults.queryResults && queryResults.queryResults.length > 0){
                                    response = {
                                        status: "Success",
                                        queryResponse: [queryResults],
                                        error: ""
                                    };
                                    
                                    // Retrieve the Restaurant Public ID for remaining queries.
                                    var responseAsJSON = JSON.parse(JSON.stringify(queryResults.queryResults[0]));
                                    restaurantPublicID = responseAsJSON.restaurant_public_id;

                                    callback(null);
                                }else{
                                    response = {
                                        status: "Error",
                                        queryResponse: [queryResults],
                                        error: "Restaurant not found."
                                    }
            
                                    callback(new Error("Restaurant not found."));
                                }
                            }else{
                                callback(error);
                            }
                        },
                        input);
                    }
                    
                }else{
                    callback(error);
                }
            },
            input);
        },
        function (callback) {
            input = [{
                field: "RestaurantPublicID",
                value: restaurantPublicID
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
                value: restaurantPublicID
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
        },
        function (callback){
            input = [{
                field: "RestaurantPublicID",
                value: restaurantPublicID
            }];

            dbModule.executeQuery("GetExtendedDetailsByRestaurantPublicID", (requestStatus: string, queryResults: QueryResult, error: Error) => {
                if (!error){
                    response.queryResponse.push(queryResults);
                    callback(null);
                }else{
                    callback(error);
                }
            },
            input);
        },
        function (callback){
            input = [{
                field: "RestaurantPublicID",
                value: restaurantPublicID
            }];

            dbModule.executeQuery("GetCategoriesByRestaurantPublicID", (requestStatus: string, queryResults: QueryResult, error: Error) => {
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
            callback(response.status, response.queryResponse, response.error);
        }else{
            response["status"] = "Error";
            response["error"] = error.message;
            callback(response.status, response.queryResponse, response.error);
        }
    });

}