/*
    KYMenus
    (c)2020-2021 Trevor D. Brown. All rights reserved.
    
    databaseTypes.ts - the interfaces and types used within the service for database utilization.
*/

type QueryType = "SELECT" | "INSERT" | "UPDATE" | "DELETE";

export interface DBConnection {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}

export interface Query {
    queryName: string;
    queryType: string;
    queryTemplate: string;
    queryInput: string[];
    queryInputValues?: string[];
    queryInstance?: string;
    dbConnection?: DBConnection;
}

export interface QueryResult {
    query: Query;
    queryResults?: string[];
}
