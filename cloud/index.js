'use strict';
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

const createResponse = (statusCode, body) => {
    return {
        'statusCode': statusCode,
        'body': body
    }
};

const getMethod = (user, event, context, callback) => {
    let params = {
        'TableName': tableName
    }, id = event.params.querystring.id, dbGet = {};
    if (id) {
        params.Key = {
            'id': id
        }
        dbGet = (params) => { return dynamo.get(params).promise() };
    } else {
        dbGet = (params) => { return dynamo.scan(params).promise() };
    }
    dbGet(params).then( (data) => {
        if (id && !data.Item) {
            callback(null, createResponse(404, "ITEM NOT FOUND"));
            return;
        } else if (id && data.Item) {
            console.log(`RETRIEVED ITEM SUCCESSFULLY WITH doc = ${data.Item.doc}`);
            callback(null, createResponse(200, data.Item.doc));
        } else {
            console.log('SCANNING TABLE');
            callback(null, createResponse(200, data.Items));
        }
        
    }).catch( (err) => { 
        console.log(`GET ITEM FAILED FOR doc = ${data.Item.doc}, WITH ERROR: ${err}`);
        callback(null, createResponse(500, err));
    });
};

const putMethod = (user, event, context, callback) => {
    let item = {
        'id': event.context['request-id'],
        'content': event.body,
        'user': user
    },
    params = {
        'TableName': tableName,
        'Item': item
    };
    let dbPut = (params) => { return dynamo.put(params).promise() };
    dbPut(params).then( (data) => {
        console.log(`PUT ITEM SUCCEEDED WITH doc = ${item.doc}`);
        callback(null, createResponse(200, null));
    }).catch( (err) => { 
        console.log(`PUT ITEM FAILED FOR doc = ${item.doc}, WITH ERROR: ${err}`);
        callback(null, createResponse(500, err)); 
    });
};

const deleteMethod = (user, event, context, callback) => {
    let id = event.params.querystring.id;
    let params = {
        'TableName': tableName,
        'Key': {
            'id': id
        },
        'ReturnValues': 'ALL_OLD'
    };
    let dbDelete = (params) => { return dynamo.delete(params).promise() };
    dbDelete(params).then( (data) => {
        if (!data.Attributes) {
            callback(null, createResponse(404, "ITEM NOT FOUND FOR DELETION"));
            return;
        }
        console.log(`DELETED ITEM SUCCESSFULLY WITH id = ${event.pathParameters.resourceId}`);
        callback(null, createResponse(200, null));
    }).catch( (err) => { 
        console.log(`DELETE ITEM FAILED FOR id = ${event.pathParameters.resourceId}, WITH ERROR: ${err}`);
        callback(null, createResponse(500, err));
    });
};

exports.handler = (event, context, callback) => {
    console.log('Ember Serverless API Event: ', event);
    console.log('Ember Serverless Context: ', context);
    let user = event.context.email;
    console.log('Ember Serverless User: ', user);
    console.log('HTTP Method: ', event.context.httpMethod);
    switch ( event.context.httpMethod ) {
        case 'GET':
            getMethod(user,event,context,callback);
            break;
        case 'PUT':
        case 'POST':
            putMethod(user,event,context,callback);
            break;
        case 'DELETE':
            deleteMethod(user,event,context,callback);
            break;
        default:
            callback(null, createResponse(500, 'Unsupported Method: ' + context.httpMethod));
            break;
    }    
};