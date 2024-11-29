export const SUBSCRIBERS = {
    re_home : {
        host : process.env.SUBSCRIBER_REHOME_SERVICE_HOST,
        path : '/api/docusign',
        token : process.env.SUBSCRIBER_REHOME_TOKEN,
        version : "1.0.0"
    },
    california_first :{
        host : process.env.SUBSCRIBER_CALIFORNIA_FIRST_SERVICE_HOST,
        path : '/api/docusign/record_envelope_status',
        token : process.env.SUBSCRIBER_CALIFORNIA_FIRST_TOKEN,
        version : "2.0.0"
    }
}