/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    'ember-bootstrap': {
        'importBootstrapTheme': true
    }
  });

  // AWS API Gateway JavaScript SDK Deps
  app.import('vendor/jsbn.js');
  app.import('vendor/jsbn2.js');
  app.import('vendor/sjcl.js');
  app.import('vendor/amazon-cognito/aws-cognito-sdk.min.js');
  app.import('vendor/amazon-cognito/amazon-cognito-identity.min.js');
  app.import('bower_components/aws-sdk/dist/aws-sdk.js');

  // jwt-decode
  app.import('bower_components/jwt-decode/build/jwt-decode.min.js');

  // AWS API Gateway Generated SDK
  app.import('vendor/apiGateway-js-sdk/lib/axios/dist/axios.standalone.js');
  app.import('vendor/apiGateway-js-sdk/lib/CryptoJS/rollups/hmac-sha256.js');
  app.import('vendor/apiGateway-js-sdk/lib/CryptoJS/rollups/sha256.js');
  app.import('vendor/apiGateway-js-sdk/lib/CryptoJS/components/hmac.js');
  app.import('vendor/apiGateway-js-sdk/lib/CryptoJS/components/enc-base64.js');
  app.import('vendor/apiGateway-js-sdk/lib/url-template/url-template.js');
  app.import('vendor/apiGateway-js-sdk/lib/apiGatewayCore/sigV4Client.js');
  app.import('vendor/apiGateway-js-sdk/lib/apiGatewayCore/apiGatewayClient.js');
  app.import('vendor/apiGateway-js-sdk/lib/apiGatewayCore/simpleHttpClient.js');
  app.import('vendor/apiGateway-js-sdk/lib/apiGatewayCore/utils.js');
  app.import('vendor/apiGateway-js-sdk/apigClient.js');

  return app.toTree();
};
