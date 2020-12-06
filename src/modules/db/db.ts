/*
    KYMenus
    (c)2020 Trevor D. Brown. All rights reserved.
    
    db.ts - the local database interface for the service.
    Note: this interface uses a query lookup system, to help prevent SQL injection.
*/

import * as mysql from 'mysql';
import queryDictionary = require('./../../support/db/queries.json');
import appConfig = require('./../../private/config.json')

import {Status} from "../../types/generalTypes";
import {DBConnection, Query, QueryResult} from '../../types/databaseTypes';

// Query Database
function queryDatabase (query: Query, dbConnection: mysql.Connection, callback: (requestStatus: Status, queryResponse: QueryResult) => void): void {
    dbConnection.connect();

    dbConnection.query(<string>query.queryInstance, (error: mysql.QueryError, rows: mysql.RowDataPacket[]) => {
        var requestStatus: Status;
        var queryResults: string[] = [];

        if (!error){
            requestStatus = "Success";

            if (rows){
                rows.forEach(row => {
                    queryResults.push(JSON.parse(JSON.stringify(row)));
                });
            }else{
                queryResults = [];
            }

        }else{
            requestStatus = "Error";
            queryResults = [];
        }

        var mysqlQueryResponse: QueryResult = {
            "query": query,
            "queryResults": queryResults
        };

        dbConnection.end();
        
        callback(requestStatus, mysqlQueryResponse);
    });
}

// Establish Database Connection
function connectToDatabase (callback: (requestStatus: Status, dbConnection: mysql.Connection) => void): void {
    var requestStatus: Status;

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

    if (dbConnection){
        requestStatus = "Success";
    }else{
        requestStatus = "Error"
    }

    callback(requestStatus, dbConnection);

}

// Query Input Injection Function (if applicable...)
function queryInputInjection (query: Query, input: [{field: string; value: string;}], callback: (status: Status) => void): void {
    var queryToUpdate = query.queryTemplate;
    var processingStatus: Status;

    input.forEach(entry => {
        var fieldToReplace: string = "\$" + entry.field;
        queryToUpdate = queryToUpdate.replace(fieldToReplace, entry.value);
    });

    query.queryInstance = queryToUpdate;

    processingStatus = "Success";

    callback(processingStatus);
}

// Query Lookup Function
function queryLookup (queryName: string, callback: (status: Status, queryObject: Query) => void): void {
    var queryRequestStatus: Status;
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
export function executeQuery (queryName: string, callback: (requestStatus: Status, queryFound?: QueryResult) => void, queryInput: [{field: string; value: string;}]): void {
    
    queryLookup(queryName, (requestStatus, newQuery) => {
        if (requestStatus == "Success"){
            queryInputInjection(newQuery, queryInput, (requestStatus) => {
                if (requestStatus == "Success"){
                    connectToDatabase((requestStatus, dbConnection) => {
                        if (requestStatus == "Success"){
                            queryDatabase (newQuery, dbConnection, (requestStatus, queryResponse) => {
                                callback(requestStatus, queryResponse);
                            });
                        }else{
                            callback(requestStatus);
                        }
                    });
                }else{
                    callback(requestStatus);
                }
            });
        }else{
            callback(requestStatus);
        }
    });

}