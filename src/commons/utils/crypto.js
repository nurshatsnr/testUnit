import CryptoJS from 'crypto-js';
import { log } from './logger';
//const CryptoJS = require('crypto-js');

const saltRounds = 10;

// export const encrypt = async (password) => {  
//   try {
//     log.debug(`Password to encrypt:=>${password}`);
//     var salt = await bcrypt.genSalt(saltRounds);
//     var hash = await bcrypt.hash(password, salt);
//     log.debug(`hash Password to encrypt:=>${hash}`);
//     return {hash: hash};
//   } catch (e) {
//     return {error: e};
//   }
// }

// export const decrypt = async (plainPass, hashword) => {
//   try {
//     return await bcrypt.compare(plainPass, hashword);
//   } catch (e) {
//     return false;
//   }  
// };

export const encrypt =  async (password) => {  
  try {
    log.debug(`password=> ${password}`);
    var salt = "!!H1a9r7s3h02M1a4h~~";
    var hash = CryptoJS.HmacSHA256(password,salt);
    log.debug(`hash=> ${hash}`);
    var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
    log.debug(`hashInBase64=> ${hashInBase64}`);
    return {hash: hashInBase64};
  } catch (e) {
    return {error: e};
  }
}

export const decrypt = async (plainPass, hashword) => {
  try {
    return true;//await bcrypt.compare(plainPass, hashword);
  } catch (e) {
    return false;
  }  
};


export const encryptOtp =  async (password) => {  
  try {
    log.debug(`encryptOtp password=> ${password}`);
    var salt = "~~1M4a0H2e1Y9H7a3R!!";
    var hash = CryptoJS.HmacSHA256(password,salt);
    log.debug(`hash=> ${hash}`);
    var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
    log.debug(`hashInBase64=> ${hashInBase64}`);
    return {hash: hashInBase64};
  } catch (e) {
    return {error: e};
  }
}