import {AppConfig} from "../../commons/environment/appconfig";

export const API_ROUTES = {
    SPRING_LAB: {
        INQUIRIES: `${AppConfig.RF_AVM_BASE_URL}/v2/pace/inquiries`,
        BULK_ATTESTATION_GROUPS: `${AppConfig.RF_AVM_BASE_URL}/v2/pace/attestationGroups`,
        ATTESTATION_GROUPS: (fin_app_id) => `${AppConfig.RF_AVM_BASE_URL}/v2/pace/attestationGroups/${fin_app_id}`,
        REVOKE_ATTESTATIONS: (fin_app_id) => `${AppConfig.RF_AVM_BASE_URL}/v2/pace/attestationGroups/${fin_app_id}/revoke`,
        GET_ATTESTATION_GROUPS: (fin_app_id) => `${AppConfig.RF_AVM_BASE_URL}/v2/pace/attestationGroups/${fin_app_id}`,
    }
};


