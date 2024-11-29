// import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
// import streamToBuffer from 'stream-to-array';
import { log } from "../../../commons/utils/logger";
// import { fromBase64 } from 'aws-sdk';
const { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamToBuffer = promisify(require('stream-to-array'));
const { fromBase64 } = require("@aws-sdk/util-base64-node");

function repairBase64(base64String) {
    // Remove any whitespace
    let cleanedString = base64String.replace(/\s/g, '');

    // Calculate the required padding
    const padding = (4 - (cleanedString.length % 4)) % 4;

    // Append the necessary number of '=' padding characters
    cleanedString += '='.repeat(padding);

    // Replace any non-Base64 characters (optional)
    cleanedString = cleanedString.replace(/[^A-Za-z0-9+/=]/g, '');

    return cleanedString;
}


export const uploadPdfToS3 = async (base64Pdf, bucketName, objectKey) => {
    try {
        // Add the correct padding in base64 string if not present

        base64Pdf = repairBase64(base64Pdf);


        // Convert base64 string to a buffer
        const pdfBuffer = Buffer.from((fromBase64(base64Pdf)));

        log.info("TYPEOF pdfBuffer " + typeof pdfBuffer)
        // Create an S3 client
        const s3Client = new S3Client({ region: "us-east-1" }); // replace with your region

        // Create a PutObjectCommand
        const putObjectCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            Body: pdfBuffer,
            ContentType: "application/pdf"
        });

        log.info("S3 PARAMS");
        log.info(JSON.stringify({
            Bucket: bucketName,
            Key: objectKey,
            Body: "buffer hidden from logs",
            ContentType: "application/pdf"
        }))

        // Upload the buffer to S3
      await s3Client.send(putObjectCommand).then((res) => {
            log.info("S3 then upload Results");
            log.info(JSON.stringify(res));
        })
            .catch((err) => {
                log.info("S3 UPLOAD ERROR ");
                log.info(JSON.stringify(err));
            })

      
    } catch (err) {
        log.error('File upload Failed from aws-sdk');
        log.error(err);
        log.error(err.message);
        return err;
    }
}

export async function fileExistsInS3(bucket, key) {
    try {
        log.debug("TESTING FOR S# FILE EXISTENCE " + key + " bucket " + bucket);
        let param = { Bucket: bucket, Key: key }
        log.debug("PARAMS " + JSON.stringify(param));

        const s3Client = new S3Client({ region: "us-east-1" }); // replace with your region
        const command = new GetObjectCommand(param);
        const response = await s3Client.send(command);

        // Convert the stream to a buffer
        const array = await streamToBuffer(response.Body);
        const buffer = Buffer.concat(array);

        return buffer;
    } catch (error) {
        log.debug("ERROR IN FINDING S# FILE ");
        log.debug(error)
        if (error.name === 'NotFound') {
            return false;
        }
        throw error;
    }
}
