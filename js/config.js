// Site configuration.
//
// askEndpoint: URL of the AI discovery API (AWS Lambda function URL or API Gateway
// route) that Ask the Archive POSTs questions to. Leave empty to use the local
// keyword match over js/data.js instead.
//
// contactEndpoint: URL the Contact form POSTs messages to as JSON
// ({ name, email, affiliation, topic, message, page }). Leave empty to open the
// visitor's email app addressed to contactEmail instead.
window.ACIS_CONFIG = {
  askEndpoint: "",
  askTimeoutMs: 30000,
  contactEndpoint: "",
  contactEmail: "digitalprojects@law.stanford.edu",
};
