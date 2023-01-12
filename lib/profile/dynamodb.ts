
import DynamoDB from 'aws-sdk/clients/dynamodb';

export const DynamoDBInstance = new DynamoDB({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY as string,
        secretAccessKey: process.env.SECRET_KEY as string
    },
    region: process.env.REGION,
})
export const dbClient = new DynamoDB.DocumentClient({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY as string,
        secretAccessKey: process.env.SECRET_KEY as string
    },
    region: process.env.REGION,
    params: {
        TableName: process.env.PROFILE_TABLE_NAME,
    }
})

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    get: (params: any) => dbClient.get(params).promise(),
    put: (params: any) => dbClient.put(params).promise(),
    query: (params:any) => dbClient.query(params).promise(),
    update: (params:any) => dbClient.update(params).promise(),
    delete: (params: any) => dbClient.put(params).promise(),

}