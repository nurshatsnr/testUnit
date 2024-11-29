import fs from 'fs';
import * as AWS from "aws-sdk";
import { validateRequestFields } from "../utils/validateUtils";
import { log } from './logger';

AWS.config.update({ region: "us-east-1" });

export const execute = async (bucketName) => {
  let response = {};
  var s3 = new AWS.S3();
  try {
    log.debug(`inside s3 creation `);
    var params = {
      Bucket: `jotp-tmpl-${bucketName}`

    };
    log.debug(`params s3 creation2222 => ${JSON.stringify(params)}`);
    let response = await s3.createBucket(params).promise();
    log.debug(`response is s3 creation is  =>${response}`)
  } catch (error) {
    log.error("Json Parsing error ==>", error);
    response = { body: "FAILED", description: error };
    return response;
  }
};

export const uploadFileWithBody = async (uploadParams) => {
  let response = {};
  let requiredFileds = ["Bucket", "Key", "ContentType"];

  try {
    //uploadParams.Body = file.data;
    log.debug("uploadParams.Body..");
    log.debug(uploadParams.Body);
    // const fileContent  = Buffer.from(file.data, 'binary');
    // uploadParams.Body= fileContent;
    log.debug('uploadFile uploadParams ==>', uploadParams);

    let s3 = new AWS.S3();
    let res = await s3.upload(uploadParams).promise();
    log.debug('upload result ==>', res);

    response = { 'body': 'UPLOAD_SUCCESS', 'statusCode': '200', data: res }
    return response;



  } catch (error) {
    log.error(`uploadFile error ===> ${JSON.stringify(error)}`);
    response = { 'body': 'UPLOAD_FAILED', 'description': error, 'statusCode': '500' }
    return response;
  }
}


export const uploadFile = async (uploadParams, file) => {
  let response = {};
  let requiredFileds = ["Bucket", "Key", "ContentType"];

  try {
    uploadParams.Body = file.data;

    // const fileContent  = Buffer.from(file.data, 'binary');
    // uploadParams.Body= fileContent;
    log.debug('uploadFile uploadParams ==>', uploadParams);

    let s3 = new AWS.S3();
    let res = await s3.upload(uploadParams).promise();
    log.debug('upload result ==>', res);

    response = { 'body': 'UPLOAD_SUCCESS', 'statusCode': '200', data: res }
    return response;



  } catch (error) {
    log.error(`uploadFile error ===> ${JSON.stringify(error)}`);
    response = { 'body': 'UPLOAD_FAILED', 'description': error, 'statusCode': '500' }
    return response;
  }
}

export const uploadFileData = async (uploadParams, data) => {
  let response = {};
  let requiredFileds = ["Bucket", "Key", "ContentType"];

  try {
    const validationResponse = validateRequestFields(uploadParams, requiredFileds);

    if (validationResponse === true) {

      let s3 = new AWS.S3();
      let res = await s3.upload(uploadParams).promise();
      log.debug('upload result ==>', res);

      response = { 'body': 'UPLOAD_SUCCESS', 'statusCode': '200' }
      return response;

    } else {
      log.debug(`Required data is missing ${validationResponse}`);
      let errorMsg = validationResponse;
      response = { 'body': 'UPLOAD_FAILED', 'description': errorMsg, 'statusCode': '501' };
      return response;
    }

  } catch (error) {
    log.error(`uploadFile error ===> ${JSON.stringify(error)}`);
    response = { 'body': 'UPLOAD_FAILED', 'description': error, 'statusCode': '500' }
    return response;
  }
}


export const readS3File = async (fileName, bucketName) => {
  try {
    var s3Data = await readTxtFile(fileName, bucketName);
      log.debug(s3Data,"s3Data");
      return s3Data;
  } catch (err) {
    log.error('Error:', err);
  }
}

const readTxtFile = (fileName, bucketName) => {
  return new Promise(function (resolve, reject) {

    var s3Bkt = new AWS.S3();
    // s3Bkt.config.update({
    //   accessKeyId: 'AKIA3FSXGL3QQFYWH762',
    //   secretAccessKey: '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'
    // })
      var params = { Bucket: bucketName, Key: fileName};
    log.debug(fileName,"fileName");
     s3Bkt.getObject(params, function (err, data) {
          if (err) {
              reject(err.message);
          } else {
              var data = Buffer.from(data.Body).toString('utf8');
              resolve(data);

              
          }
      });
  });
}