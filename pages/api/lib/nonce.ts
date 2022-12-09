const crypto = require('crypto');
import dynamo, { dbClient, DynamoDBInstance } from '../../../lib/dynamo';

export async function getNonce(walletId: string) {
  const params = {
    Statement: `SELECT "nonce" 
        FROM "${process.env.TABLE_NAME}" WHERE "walletId"='${walletId}'`,
  };
  console.log('params', params)
  return DynamoDBInstance.executeStatement(params).promise();
};


export async function updateNonce(walletId: string) {
  const nonce = crypto.randomBytes(16).toString('hex');
  // console.log('nonce', nonce)

  try {
    await dynamo.update({
      Key: {
        walletId
      },
      UpdateExpression: 'set nonce = :n',
      ExpressionAttributeValues: {
        ':n': nonce,
      },
      ReturnValues: 'ALL_NEW'
    })
    return { nonce }

  } catch (error) {
    throw new Error("unable to update nonce " + error)
  }

};