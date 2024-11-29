import * as AWS from "aws-sdk";
import {replaceAll} from "../commonUtils";

import {getSecuredChnlVal, getSecuredChnlValOnly} from "../commonUtils";
import {encrypt} from "../crypto";

/*
1. Pull the region from env file
*/
AWS.config.update({region: "us-east-1"});
const sns = new AWS.SNS({apiVersion: "2010-03-31"});

import {AppConfig} from "../../environment/appconfig";
import {log} from "../logger";

/**
 Returns the AWS account number associated with the current AWS Lambda execution context.
 @param {object} context - The current AWS Lambda execution context object.
 @returns {Promise<string>} - A Promise that resolves to the AWS account number as a string.
 */
export const getAWSAccountNumber = async (context) => {
    // log.debug(`Context is ${JSON.stringify(context)}`);
    let awsAccountId = context.invokedFunctionArn.split(":")[4];
    // log.debug(`Acount number is ${awsAccountId}`);

    return awsAccountId;
}


/**
 Sends a message to the specified AWS SNS topic using the AWS SDK for Node.js.
 @param {object} msgToBeSent - The message object to be sent to the SNS topic.
 @param {string} topicName - The name of the AWS SNS topic to which the message should be sent.
 @returns {Promise<object>} - A Promise that resolves to an object containing information about the published message.
 */
export const sendMsgToTopic = async (msgToBeSent, topicName) => {
    log.debug(`topicName : ${topicName}`);
    // log.debug(`msgToBeSent : ${JSON.stringify(msgToBeSent)}`);

    //arn:aws:sns:us-east-1:324269470915:snsname

    let topicArn = `arn:aws:sns:${AppConfig.REGION}:${'324269470915'}:${AppConfig.APP_PREFIX}-${AppConfig.environment}-${topicName}`;
    log.debug(`Topic ARN Name ${topicArn}`);
    delete msgToBeSent.rawData.awsAccountNumber;
    const params = {
        Message: JSON.stringify(msgToBeSent),
        TopicArn: topicArn
    };
    log.debug("sendMsgToTopic params ===>" + JSON.stringify(params));
    let publishTextPromise = await sns.publish(params).promise();
    log.debug("sendMsgToTopic ===> "+ JSON.stringify(publishTextPromise));

    return publishTextPromise;
};
