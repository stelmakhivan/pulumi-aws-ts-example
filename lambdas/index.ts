import * as aws from '@pulumi/aws';

import {
  APIGatewayProxyEvent,
} from 'aws-lambda/trigger/api-gateway-proxy';
import { generate } from 'shortid';

import { studentsTable } from '../ddb'

interface Student {
  id: string;
  name: string;
  birthdate: string;
}

export const getStudent = new aws.lambda.CallbackFunction<APIGatewayProxyEvent, unknown>('getStudent', {
  memorySize: 128,
  callback: async (req, ctx, cb) => {
    if (!req.pathParameters?.id) {
      cb('Id is required')
    }

    const ddbClient = new aws.sdk.DynamoDB.DocumentClient();

    try {
      const tableData = await ddbClient.get({
        TableName: studentsTable.name.get(),
        Key: {
          id: req.pathParameters?.id,
        },
      }).promise()

      cb(undefined, {
        statusCode: 200,
        body: JSON.stringify({ item: tableData.Item }),
        isBase64Encoded: false,
        headers: {
          'content-type': 'application/json',
        },
      })
    } catch (err) {
      console.error('Unable to read item. Error JSON:', JSON.stringify(err, null, 2));
      cb(err.message || 'Unable to read item.')
    }
  },
})

export const saveStudent = new aws.lambda.CallbackFunction<APIGatewayProxyEvent, unknown>('saveStudent', {
  memorySize: 128,
  callback: async (req, ctx, cb) => {
    if (!req.body) {
      return cb('Nothing to save')
    }

    const data: Pick<Student, 'name' | 'birthdate'> = JSON.parse(Buffer.from(req.body, 'base64').toString('UTF-8'));

    if (!data.name) {
      return cb('Name is required')
    }
    if (!data.birthdate) {
      return cb('Birthdate is required')
    }

    const ddbClient = new aws.sdk.DynamoDB.DocumentClient();

    const Item = {
      id: generate(),
      name: data.name,
      birthdate: data.birthdate,
    }

    try {
      await ddbClient.put({
        TableName: studentsTable.name.get(),
        Item,
      }).promise()

      cb(undefined, {
        statusCode: 201,
        body: JSON.stringify({ item: Item }),
        isBase64Encoded: false,
        headers: {
          'content-type': 'application/json',
        },
      })
    } catch (err) {
      console.error('Unable to save item. Error JSON:', JSON.stringify(err, null, 2));
      cb(err.message || 'Unable to save item.')
    }
  },
})

export const updateStudent = new aws.lambda.CallbackFunction</*Pick<Student, 'id'> & Partial<Student>*/ APIGatewayProxyEvent, unknown>('updateStudent', {
  memorySize: 128,
  callback: async (req, ctx, cb) => {
    if (!req.body || !req.pathParameters?.id) {
      return cb('Nothing to update', {
        statusCode: 204,
      })
    }

    const data: Pick<Student, 'id'> & Partial<Student> = JSON.parse(Buffer.from(req.body, 'base64').toString('UTF-8'));

    if (!Object.keys(data).length) {
      return cb('Nothing to update', {
        statusCode: 204,
      })
    }

    const params: { [key: string]: string } = {}
    let updateExpression = 'set'

    if (data.name) {
      params[':n'] = data.name;
      updateExpression += ' #n=:n'
    }
    if (data.birthdate) {
      params[':b'] = data.birthdate
      updateExpression += ', birthdate=:b'
    }

    const ddbClient = new aws.sdk.DynamoDB.DocumentClient();

    try {
      await ddbClient.update({
        TableName: studentsTable.name.get(),
        Key: {
          id: req.pathParameters.id,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: params,
        ExpressionAttributeNames: {
          '#n': 'name',
        },
      }).promise()

      cb(undefined, {
        statusCode: 202,
        body: "Successfully updated",
        isBase64Encoded: false,
        headers: {
          'content-type': 'application/json',
        },
      })
    } catch (err) {
      console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
      cb(err.message || 'Unable to update item.')
    }
  },
})

export const deleteStudent = new aws.lambda.CallbackFunction<APIGatewayProxyEvent, unknown>('deleteStudent', {
  memorySize: 128,
  callback: async (req, ctx, cb) => {
    if (!req.pathParameters?.id) {
      cb('Id is required')
    }

    const ddbClient = new aws.sdk.DynamoDB.DocumentClient();

    try {
      await ddbClient.delete({
        TableName: studentsTable.name.get(),
        Key: {
          id: req.pathParameters?.id,
        },
      }).promise()

      cb(undefined, {
        statusCode: 204,
        body: 'Successfully deleted',
        isBase64Encoded: false,
        headers: {
          'content-type': 'application/json',
        },
      })
    } catch (err) {
      console.error('Unable to delete item. Error JSON:', JSON.stringify(err, null, 2));
      cb(err.message || 'Unable to delete item.')
    }
  },
})
