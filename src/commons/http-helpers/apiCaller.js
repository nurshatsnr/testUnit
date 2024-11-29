import { replaceAll } from "../utils/commonUtils";
import * as AWS from "aws-sdk";
import { apiResponse, apiError } from "./api-response";
import { log } from "../utils/logger";
import axios from "axios";


export const get = async (url, params) => {
    log.debug(`response from apiCaller2222222222222222 ${url}`);
    log.debug(`response from body ${JSON.stringify(params)}`);

    try {
        const response = await axios.request({
            url: url,
            params: params,
            method: 'get'
        });
        log.debug(`response from body ${JSON.stringify(response)}`);

        return response.data;
    } catch (error) {
        log.error(`response from Error ${JSON.stringify(error)}`);

        return error;
    }
};

export const post = async (headers, body, apiUrl) => {
  let response1 = {};

  try {
    log.debug(`response from apiCaller2222222222222222 ${apiUrl}`);
    log.debug(`response from headers23 ${JSON.stringify(headers)}`);
    log.debug(`response from body ${JSON.stringify(body)}`);
    const responseFromAxois = await axois.post(apiUrl, body, {
      headers: headers,
    });

    log.debug(
      `responseFromAxois ||||||||--------------=> ${JSON.stringify(
        responseFromAxois.data
      )}`
    );

    return responseFromAxois.data;
  } catch (error) {
    log.error("apiCaller Error ==>", error);
    let response1 = { body: error, statusCode: "500" };

    return apiError(500, response1);
  }
};

export const postWithFullResponse = async (headers, body, apiUrl) => {
  let response1 = {};

  try {
    log.debug(`response from apiCaller2222222222222222 ${apiUrl}`);
    log.debug(`response from headers23 ${JSON.stringify(headers)}`);
    log.debug(`response from body ${JSON.stringify(body)}`);
    const responseFromAxois = await axois.post(apiUrl, body, {
      headers: headers,
    });
    
    return responseFromAxois;
  } catch (error) {
    log.error("apiCaller Error ==>", error);
    let response1 = { body: error, statusCode: "500" };

    return apiError(500, response1);
  }
};



export const storeToS3 =async (responseFromAxois)=> {

  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    const bucketname = "jotpbkt";
    let blob = new Blob([responseFromAxois], {type: 'text/plain'});

    let filename = "abc.txt";
    var params = {
      Bucket: bucketname,
      Key: filename,
      Body: blob,
    };

    const s3Response = await s3.putObject(params).promise();

    //log.debug(  `responseFromAxois only ||||||||---bbbbb-----------=> ${responseFromAxois.toString()}`);
    log.debug(
      `responseFromAxois only ||||||||---s3Response-----------=> ${s3Response}`
    );

}