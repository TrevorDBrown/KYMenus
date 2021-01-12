/*
    KYMenus
    (c)2020-2021 Trevor D. Brown. All rights reserved.
    
    db.ts - the local database interface for the service.
    Note: this interface uses a query lookup system, to help prevent SQL injection.
*/

import * as mysql from 'mysql';
import * as async from 'async';
import queryDictionary = require('./../../support/db/queries.json');
import appConfig = require('./../../private/config.json')

import {DBConnection, Query, QueryResult} from '../../types/databaseTypes';

// Query Database
function queryDatabase (query: Query, dbConnection: mysql.Connection, callback: (requestStatus: string, queryResponse?: QueryResult, error?: Error) => void): void {
    dbConnection.connect();

    dbConnection.query(<string>query.queryInstance, (dbError: mysql.QueryError, rows: mysql.RowDataPacket[]) => {
        var requestStatus: string = "";
        var queryResults: string[] = [];
        var mysqlQueryResponse: QueryResult;
        var error: Error;

        if (!dbError){
            requestStatus = "Success";

            if (rows){
                rows.forEach(row => {
                    queryResults.push(JSON.parse(JSON.stringify(row)));
                });
            }else{
                queryResults = [];
            }

            mysqlQueryResponse = {
                "query": query,
                "queryResults": queryResults
            };
    
            dbConnection.end();
            
            callback(requestStatus, mysqlQueryResponse);

        }else{
            requestStatus = "Error";
            queryResults = [];
            error = <Error>dbError;

            mysqlQueryResponse = {
                "query": query,
                "queryResults": queryResults
            };

            dbConnection.end();
            callback(requestStatus, mysqlQueryResponse, error);
        }
    });
}

// Establish Database Connection
function connectToDatabase (callback: (requestStatus: string, dbConnection: mysql.Connection, error?: Error) => void): void {
    var requestStatus: string = "";

    var dbHost: string = "";
    var dbPort: number = 0;
    var dbUsername: string = "";
    var dbPassword: string = "";

    var dbConfigLookup = appConfig.find(i => i.settingName === "dbConfig");
    
    if (dbConfigLookup){
        dbConfigLookup["parameters"].forEach(parameter => {
            switch (parameter.parameterName) {
                case "host": {
                    dbHost = parameter.value;
                    break;
                }
                case "port": {
                    dbPort = parseInt(parameter.value);
                    break;
                }
                case "username": {
                    dbUsername = parameter.value;
                    break;
                }
                case "password": {
                    dbPassword = parameter.value;
                    break;
                }
                default: {
                    console.log("Error - parameter not defined.");
                    break;
                }
                    
            }
        });
    }

    const dbConnection = mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUsername,
        password: dbPassword,
        database: "KYMENUS"
    });

    requestStatus = "Success";

    callback(requestStatus, dbConnection);

}

// Query Input Injection Function (if applicable...)
function queryInputInjection (query: Query, input: [{field: string; value: string;}], callback: (status: string, error?: Error) => void): void {
    var queryToUpdate = query.queryTemplate;
    var processingStatus: string = "";

    input.forEach(entry => {
        var fieldToReplace: string = "~" + entry.field;
        queryToUpdate = queryToUpdate.replace(fieldToReplace, "= '" + entry.value + "'");
    });

    query.queryInstance = queryToUpdate;

    processingStatus = "Success";

    callback(processingStatus);
}

// Query Lookup Function
function queryLookup (queryName: string, callback: (status: string, queryObject: Query, error?: Error) => void): void {
    var queryRequestStatus: string = "";
    var newQuery: Query;

    var queryDictionaryLookup = queryDictionary.find(i => i.queryName === queryName);

    if (queryDictionaryLookup){
        queryRequestStatus = "Success";
        
        // Initialize a Query object.
        newQuery = {
            queryName: queryName,
            queryType: queryDictionaryLookup.queryType,
            queryInput: queryDictionaryLookup.queryInputs,
            queryTemplate: queryDictionaryLookup.queryTemplate
        };

    }else{
        queryRequestStatus = "Error";
        
        newQuery = {
            queryName: "Unknown",
            queryType: "Unknown",
            queryInput: ["Unknown"],
            queryTemplate: "Unknown"
        };
    }

    callback(queryRequestStatus, newQuery);
} 

// Publicly exposed function for query calls
export function executeQuery (queryName: string, callback: (requestStatus: string, queryFound?: QueryResult, error?: Error) => void, queryInput?: [{field: string; value: string;}]): void {
    var newQuery: Query;
    var queryResponse: QueryResult;
    var dbConnection: mysql.Connection;

    async.series([
        function(callback){
            queryLookup(queryName, (requestStatus, query, error) => {
                if (requestStatus === "Success"){
                    newQuery = query;
                    callback(null, newQuery);
                }else{
                    callback(error, null);
                }
            });
        },
        function(callback){
            if (queryInput){
                queryInputInjection(newQuery, queryInput, (requestStatus, error) => {
                    if (requestStatus === "Success"){
                        callback(null, newQuery);
                    }else{
                        callback(error, null);
                    }
                });
            }else{
                newQuery.queryInstance = newQuery.queryTemplate;
                callback(null, newQuery);
            }
        },
        function(callback){
            connectToDatabase((requestStatus, connection, error) => {
                if (requestStatus === "Success"){
                    dbConnection = connection;
                    callback(null, dbConnection);
                }else{
                    callback(error, null);
                }
            });
        },
        function(callback){
            queryDatabase(newQuery, dbConnection, (requestStatus, queryResult, error) => {
                if (requestStatus === "Success"){
                    queryResponse = <QueryResult>queryResult;
                    callback(null, queryResponse);
                }else{
                    callback(error, null);
                }
            });
        }
    ], function(error, results){
        if (!error){
            callback("Success", queryResponse);
        }else{
            callback("Error", undefined, error);
        }
    });
}