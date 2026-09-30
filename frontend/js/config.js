// Site configuration.
//
// askEndpoint: URL of the AI discovery API (the backend's Lambda Function URL).
// The tracked file ships a deploy-time placeholder; amplify.yml substitutes it
// at deploy time from the Amplify app's AI_API_URL environment variable. Left as
// the placeholder (local development) or empty, Ask the Archive uses the local
// keyword match over js/data.js instead.
//
// contactEndpoint: URL the Contact form POSTs messages to as JSON
// ({ name, email, affiliation, topic, message, page }). Leave empty to open the
// visitor's email app addressed to contactEmail instead.
window.ACIS_CONFIG = {
  askEndpoint: "__AI_API_URL__",
  askTimeoutMs: 30000,
  contactEndpoint: "",
  contactEmail: "digitalprojects@law.stanford.edu",
};
