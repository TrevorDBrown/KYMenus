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

    dbConnection.query(<string>query.queryTemplate, (error: mysql.QueryError, rows: mysql.RowDataPacket[]) => {
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

    // var dbConfigLookup = appConfig.find(i => i.settingName === "dbAccess");
    
    // if (dbConfigLookup){
    //     requestStatus = "Success";
    //     var username = dbConfigLookup.parameters.find(i => i.parameterName === "username")
        
    // }else {
    //     requestStatus = "Error";
    // }

    const dbConnection = mysql.createConnection({
        host: "host",
        port: 3306,
        user: "username",
        password: "password",
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

// Query Lookup Function
function queryLookup (query: Query, callback: (status: Status) => void): void {
    var queryRequestStatus: Status;

    var queryDictionaryLookup = queryDictionary.find(i => i.queryName === query.queryName);

    if (queryDictionaryLookup){
        queryRequestStatus = "Success";
        //query.queryType = queryDictionaryLookup.queryType;
        query.queryTemplate = queryDictionaryLookup.queryTemplate;
    }else{
        queryRequestStatus = "Error";
    }

    callback(queryRequestStatus);
} 

// Publicly exposed function for query calls
export function executeQuery (queryName: string, callback: (requestStatus: Status, queryFound?: QueryResult) => void, queryInput?: string[]): void {
    
    // Initialize a Query object.
    var newQuery: Query = {
        queryName: queryName
    };

    queryLookup(newQuery, (requestStatus) => {
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

}