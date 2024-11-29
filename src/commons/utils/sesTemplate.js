import fs from 'fs';
import * as AWS from "aws-sdk";
import { validateRequestFields } from "./validateUtils";
import { log } from './logger';

AWS.config.update({region: "us-east-1"});

export const createTemplate = async (event) => {
  log.debug(`event..${JSON.stringify(event)}`);
  let response = {};
  var ses = new AWS.SES();
  try {
    log.debug(`inside execute - template creation `);
    var params = {
      Template: { /* required */
        TemplateName: event.templateName, /* required */
        HtmlPart: event.htmlData,
        SubjectPart: event.emailSubject,
        TextPart: event.textData
      }
    };
    log.debug(`params s3 creation2222 => ${JSON.stringify(params)}`);

    return ses.createTemplate(params, function(err, data) {
      if (err) { 
        log.debug(err, err.stack); // an error occurred
    }
      else {   

        log.debug(`.........................${data}`);           // successful response
    }
    });
  } catch (error) {
    log.error("Json Parsing error ==>", error);
    response = { body: "FAILED", description: error };
    return response;
  }
};

export const getTemplateByName = async (event) => {
  log.debug(`event..${JSON.stringify(event)}`);
  let response = {};
  var ses = new AWS.SES();
  try {
    log.debug(`inside execute - getTemplateByName ${event.templateName}`);
    
     var templatePromise = ses.getTemplate({TemplateName: event.templateName}).promise();
return templatePromise;
// // Handle promise's fulfilled/rejected states
// templatePromise.then(
//   function(data) {
//     log.debug("template updgetTemplateByNameated");
//     log.debug(data.Template);
//     return data.Template;
//   }).catch(
    
//     function(err) {
//     console.error(err, err.stack);
//   });


  // var params = {
  //   TemplateName: event.templateName
  // };
  // log.debug(`inside execute - params ${JSON.stringify(params)}`);
  // // ses.getTemplate(params, function(err, data) {
  // //   if (err) {
  // //     log.debug("....error...");  
  // //     log.debug(err, err.stack); 
  // //   }// an error occurred
  // //   else    { 
  // //     log.debug("got s reponse from get template");  
  // //     log.debug(data);  
  // //     return data.Template; 
  // //   }        // successful response
  // // });
  // let responseData= {};
  // ses.getTemplate(params, function(err, data) {
  //   if (err) {
  //     log.debug("....error...");  
  //     log.debug(err, err.stack); 
  //   }// an error occurred
  //   else    { 
  //     log.debug("got s reponse from get template");  
  //     log.debug(data);  
  //     responseData =  data.Template; 
  //   }        // successful response
  // });
  // log.debug(".................");
  // log.debug(responseData);
  // return responseData;

 

    
    
  } catch (error) {
    log.error("Json Parsing error ==>", error);
    response = { body: "FAILED", description: error };
    return response;
  }
};

export const updateTemplate = async (event) => {
  log.debug(`event..${JSON.stringify(event)}`);
  let response = {};
  var ses = new AWS.SES();
  try {
  

    var params = {
      Template: { /* required */
        TemplateName: event.templateName, /* required */
        HtmlPart: event.htmlData,
        SubjectPart: event.emailSubject,
        TextPart: event.textData
      }
    };
    
    // Create the promise and SES service object
    var templatePromise = new ses({apiVersion: '2010-12-01'}).updateTemplate(params).promise();
    
    // Handle promise's fulfilled/rejected states
    templatePromise.then(
      function(data) {
        log.debug("Template Updated");
        log.debug(data);
      }).catch(
        function(err) {
        console.error(err, err.stack);
      });
    
    
  } catch (error) {
    log.error("Json Parsing error ==>", error);
    response = { body: "FAILED", description: error };
    return response;
  }
};

export const deleteTemplate = async (event) => {
  log.debug(`event..${JSON.stringify(event)}`);
  let response = {};
  var ses = new AWS.SES();
  try {
  
// Create the promise and SES service object
log.debug(`inside execute -11111 deleteTemplate ${event.templateName}`);

var templatePromise =  ses.deleteTemplate({TemplateName: event.templateName}).promise();
return templatePromise;
// Handle promise's fulfilled/rejected states
// templatePromise.then(
//   function(data) {
//     log.debug("Template Deleted");
//     log.debug(data);
    
//   }).catch(
//     function(err) {
//     console.error(err, err.stack);
//   });
   
  
  } catch (error) {
    log.error("Json Parsing error ==>", error);
    response = { body: "FAILED", description: error };
    return response;
  }
};

export const getAllTemplates = async (event) => {
  log.debug(`event..${JSON.stringify(event)}`);
  let response = {};
  var ses = new AWS.SES();
  try {
// Create the promise and SES service object
var templatePromise = new AWS.SES({apiVersion: '2010-12-01'}).listTemplates({MaxItems: 1000}).promise();

// Handle promise's fulfilled/rejected states
templatePromise.then(
  function(data) {
    log.debug("Template List");
    log.debug(data);
    return data;
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });
    
    
  } catch (error) {
    log.error("Json Parsing error ==>", error);
    response = { body: "FAILED", description: error };
    return response;
  }
};

