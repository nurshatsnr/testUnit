/**
 * Configuration Object that contains environment specific variables.
 *
 */
export const AppConfig = {
    REGION: process.env.AWS_REGION,
    environment: process.env.ENVIRONMENT,
    env: process.env.ENV,
    AWS_SECRET_KEY_ID: process.env.AWS_SECRET_KEY_ID,
    AWS_SECRET_KEY_VAL: process.env.AWS_SECRET_KEY_VAL,
    logLevel: process.env.LOG_LEVEL || "info",
    AUTH_URL: process.env.AUTH_URL,
    AUTH_CLIENT_ID: process.env.AUTH_CLIENT_ID,
    AUTH_CLIENT_SECRET: process.env.AUTH_CLIENT_SECRET,
    X_API_KEY: process.env.X_API_KEY,
    COGNITO_POOL_ID: process.env.pool_id,
    APP_NAME: process.env.PROJECT_NM,

    DOCUSIGN_SERVICE_HOST: process.env.DOCUSIGN_SERVICE_HOST,
    DOCUSIGN_OAUTH_TOKEN: process.env.DOCUSIGN_OAUTH_TOKEN,
    DOCUSIGN_ACCOUNT_ID: process.env.DOCUSIGN_ACCOUNT_ID,
    DOCUSIGN_RETURN_ENDPOINT: process.env.DOCUSIGN_RETURN_ENDPOINT,
    RESPONSE_TYPES: {
        SUCCESS: 'SUCCESS',
        ERROR: 'ERROR',
        FAILED: 'FAILED'
    },
    DB: {
        TIRO: {
            DB_USER: process.env.POSTGRES_USERNAME,
            DB_PASSWORD: process.env.POSTGRES_PASSWORD,
            DB_HOST: process.env.POSTGRES_SERVICE_HOST,
            DB_PORT: process.env.POSTGRES_SERVICE_PORT,
            DB_DATABASE: process.env.POSTGRES_DATABASE,
        },
    },

    POSTGRES_DB :{
        POSTGRES_DATABASE:process.env.POSTGRES_DATABASE,
        POSTGRES_PASSWORD:process.env.POSTGRES_PASSWORD,
        POSTGRES_SERVICE_HOST:process.env.POSTGRES_SERVICE_HOST,
        POSTGRES_SERVICE_PORT:process.env.POSTGRES_SERVICE_PORT,
        POSTGRES_USERNAME:process.env.POSTGRES_USERNAME,
    },


    APP_PREFIX: process.env.APP_PREFIX,
    S3: {
        FILE_UPLOAD_BUCKET: process.env.FILE_UPLOAD_BUCKET,
        FILE_UPLOAD_FOLDER: process.env.FILE_UPLOAD_FOLDER
    },

    CALIFORNIA_FIRST_FINANCING_DOCUMENTS: {
        SUBJECT: process.env.CALIFORNIA_FIRST_FINANCING_DOCUMENTS_SUBJECT,
        BLURB: process.env.CALIFORNIA_FIRST_FINANCING_DOCUMENTS_BLURB,
        REMINDER_DELAY: process.env.CALIFORNIA_FIRST_FINANCING_DOCUMENTS_REMINDER_DELAY,
        REMINDER_FREQUENCY: process.env.CALIFORNIA_FIRST_FINANCING_DOCUMENTS_REMINDER_FREQUENCY,
        EXPIRATION_AFTER: process.env.CALIFORNIA_FIRST_FINANCING_DOCUMENTS_EXPIRATION_AFTER,
        EXPIRATION_WARN: process.env.CALIFORNIA_FIRST_FINANCING_DOCUMENTS_EXPIRATION_WARN
    },

    CALIFORNIA_FIRST_COMPLETION_DOCUMENTS: {
        SUBJECT: process.env.CALIFORNIA_FIRST_COMPLETION_DOCUMENTS_SUBJECT,
        BLURB: process.env.CALIFORNIA_FIRST_COMPLETION_DOCUMENTS_BLURB,
    },

    RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS: {
        SUBJECT: process.env.RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS_SUBJECT,
        BLURB: process.env.RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS_BLURB,
        REMINDER_DELAY: process.env.RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS_REMINDER_DELAY,
        REMINDER_FREQUENCY: process.env.RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS_REMINDER_FREQUENCY,
        EXPIRATION_AFTER: process.env.RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS_EXPIRATION_AFTER,
        EXPIRATION_WARN: process.env.RENEW_PACE_FLORIDA_FINANCING_DOCUMENTS_EXPIRATION_WARN
    },

    RENEW_PACE_FLORIDA_COMPLETION_DOCUMENTS: {
        SUBJECT: process.env.RENEW_PACE_FLORIDA_COMPLETION_DOCUMENTS_SUBJECT,
        BLURB: process.env.RENEW_PACE_FLORIDA_COMPLETION_DOCUMENTS_BLURB,
    }
};

