/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'client',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.API_URL = "https://g0cgocvuu2.execute-api.us-east-1.amazonaws.com/Prod"
    ENV.AWS_REGION = "us-east-1"
    ENV.AWS_POOL_ID = "us-east-1:db1199e0-2943-4546-89d9-2398622fdb24"
    ENV.AWS_USER_POOL_ID = "us-east-1_7wXrp3JHI"
    ENV.AWS_CLIENT_ID = "5qkejo15u955n9bft9vealkt57"
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
