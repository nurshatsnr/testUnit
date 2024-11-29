import { log } from "../commons/utils/logger";
import { apiError, apiResponse } from '../commons/http-helpers/api-response';

export const sampleHandlerFunc = async (request) => {
    try {
        log.info(`request body: ${JSON.stringify(request.body)}`);
        return apiResponse({ boilerplate : success });
    } catch (e) {
        log.error(e);
        log.error(e.message);
        return apiError(500, { error: "Error" });
    }
}


