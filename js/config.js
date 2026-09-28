// Site configuration.
//
// askEndpoint: URL of the AI discovery API (AWS Lambda function URL or API Gateway
// route) that Ask the Archive POSTs questions to. Leave empty to use the local
// keyword match over js/data.js instead.
window.ACIS_CONFIG = {
  askEndpoint: "",
  askTimeoutMs: 30000,
};
