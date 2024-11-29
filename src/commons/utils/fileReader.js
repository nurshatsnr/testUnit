import fs from 'fs';
import { log } from './logger';


export const readFile = async filePath => {
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return data;
    }
    catch(err) {
      log.error(err)
    }
  }