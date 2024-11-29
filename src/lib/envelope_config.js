// Import necessary modules
const fs = require('fs');  // File system module
const yaml = require('js-yaml'); // External library to handle YAML files

function EnvelopeConfig(yamlFilePath) {
  let config = {};

  try {
    // Load the YAML file
    const fileContents = fs.readFileSync(yamlFilePath, 'utf8');
    config = yaml.load(fileContents) || {};
  } catch (e) {
    // Logging the error, assume Rails.logger equivalent exists in your system
    console.error(`Could not load configuration file ${yamlFilePath}. ${e.message}`);
    config = {};
  }

  // Function to fetch and symbolize email keys
  function email() {
    return fetchAndSymbolizeKeys("email");
  }

  // Function to fetch and symbolize reminder keys
  function reminder() {
    return fetchAndSymbolizeKeys("reminder");
  }

  // Function to fetch and symbolize expiration keys
  function expiration() {
    return fetchAndSymbolizeKeys("expiration");
  }

  // Private helper function to fetch and symbolize keys from the config
  function fetchAndSymbolizeKeys(key) {
    return config[key] || {};
  }

  // Return the functions, equivalent to exposing the class methods in Ruby
  return {
    email,
    reminder,
    expiration
  };
}

// Exporting the function
module.exports = EnvelopeConfig;
