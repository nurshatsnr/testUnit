import fs from 'fs';
import * as AWS from "aws-sdk";
import { validateRequestFields } from "../utils/validateUtils";
import { log } from './logger';

AWS.config.update({region: "us-east-1"});

export const executeCmmnRequest = async (event) => {
  let response = {};
  var ses = new AWS.SES();
  try {
    log.debug(`inside execute `);
    var params = {
        Destination: {
          ToAddresses: event.toEmailAddresses,
        },
        Message: {
          Body: {
            Text: { Data: "Test" },
          },
    
          Subject: { Data: "Test Email" },
        }
        ,
        Source: "info@sensenrespond.org",
      };
    log.debug(`params s3 creation2222 => ${JSON.stringify(params)}`);

    return ses.sendEmail(params).promise();
    
  } catch (error) {
    log.error("Json Parsing error ==>", error);
    response = { body: "FAILED", description: error };
    return response;
  }
};


export const executeCmmnRequestWithTemplate = async (event) => {
  let response = {};
  var ses = new AWS.SES();
  try {
    log.debug(`inside execute `);
    // var params = {
    //     Destination: {
    //       ToAddresses: event.toEmailAddresses,
    //     },
    //     Message: {
    //       Body: {
    //         Text: { Data: "Test" },
    //       },
    
    //       Subject: { Data: "Test Email" },
    //     }
    //     ,
    //     Source: "info@sensenrespond.com",
    //   };

    event.configurationSetName="SESFailuresTesting";
      var params =
      {
        "Source":event.fromEmailAddress,
        //"Subject":event.emailSubject,
        "Template":event.cmmnTemplateId,
       // "ConfigurationSetName": "ConfigSet",
        "Destination":{
          "ToAddresses":event?.channelContent?.toEmails
        },
        "TemplateData":JSON.stringify(event.channelContent.communitionFieldValus),
       // "DefaultTemplateData":event.channelContent.communitionFieldValus,
        ConfigurationSetName: event.configurationSetName
      };

      log.debug(params,"params");

    log.debug(`params s3 creation2222 => ${JSON.stringify(params)}`);

    //return ses.sendEmail(params).promise();
    return ses.sendTemplatedEmail(params).promise();

    
    
  } catch (error) {
    log.error("Json Parsing error ==>", error);
    response = { body: "FAILED", description: error };
    return response;
  }
};

