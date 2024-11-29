import { Pool } from "pg";
import { AppConfig } from "../../../commons/environment/appconfig";
import { QUERIES } from "../queries";
import { log } from "../../../commons/utils/logger";

export const uploadDataInTKL = async (appguid, param1, param2, param3,
    param4,
    param5, dataTree_AVMRes, veroSelect_HighAVMValue, veroSelect_AVMLowValue, veroSelect_AVMFsdPercent,
    veroSelect_AVMConfidenceScore, veroSelect_AVMMarketValue, veroSelect_TrackingId, veroSelect_AVMRes) => {
    try {

        log.info("DB UPLOAD STARTED");

        const tklClient = new Pool({
            host: AppConfig.POSTGRES_DB.POSTGRES_SERVICE_HOST,
            user: AppConfig.POSTGRES_DB.POSTGRES_USERNAME,
            password: AppConfig.POSTGRES_DB.POSTGRES_PASSWORD,
            database: AppConfig.POSTGRES_DB.POSTGRES_DATABASE,
            port: AppConfig.POSTGRES_DB.POSTGRES_SERVICE_PORT,
            ssl: AppConfig.environment === 'prod' ? false : { rejectUnauthorized: false }
        });

        const tklqueryText = QUERIES.TKL_RF.AVM_SCORE_UPSERT(appguid, param1, param2, param3, param4,
            param5, dataTree_AVMRes, veroSelect_HighAVMValue, veroSelect_AVMLowValue, veroSelect_AVMFsdPercent,
            veroSelect_AVMConfidenceScore, veroSelect_AVMMarketValue, veroSelect_TrackingId, veroSelect_AVMRes);
        const tklqueryName = `upsert-avm-score-report`;
        const tklquery = {
            // give the query a unique name
            name: tklqueryName,
            text: tklqueryText,
        };

        log.info(`query: ${JSON.stringify(tklquery)}`);

        const requestUploadRes = await tklClient.query(tklquery);
        log.info(`Result found: ${JSON.stringify(requestUploadRes.rows)}`);

        await tklClient.end();
        return {
            type: AppConfig.RESPONSE_TYPES.SUCCESS,
            payload: requestUploadRes
        };
    } catch (error) {
        log.error(JSON.stringify(error));
        log.error(JSON.stringify(error.message));
        return {
            type: AppConfig.RESPONSE_TYPES.FAILED,
            payload: error
        };
    }

}