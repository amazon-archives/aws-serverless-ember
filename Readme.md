# Ember Serverless on AWS

Ember Serverless is a Serverless Ember.js application running on AWS. It utilizes a fully serverless architecture:

 - Cognito User Pools for authentication, registration, and confirmation
 - API Gateway for REST API 
 - Lambda as a Backend
 - CloudFormation for Infrastructure management and OpenAPI for API resource management

The application utilizes Ember.js methodology by abstracting API Gateway communication into adapters, allowing you to write controller code utilizing ember models. The API Gateway SDK that is generated from API Gateway can easily be replaced if you update your API by simple replacing the `vendor/apiGateway-js-sdk` with the generated one from API Gateway. Lambda functions can easily be updated by running the included `cloud/deploy.sh` bash script which simply runs the appropriate cloudformation commands for you.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with NPM)
* [Bower](https://bower.io/)
* [AWS CLI](https://aws.amazon.com/cli)
* [Ember CLI](https://ember-cli.com/)

## Installation

* `git clone <repository-url>` this repository
* `cd client`
* `npm install`
* `bower install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

## Creating the AWS Infrastructure

***Please NOTE: the following steps will incur charges on your AWS account, please see the appropriate pricing pages for the services***

First, run the hosting template which will create the S3 infrastructure for hosting the web app and your deployed lambda code:

    cd cloud
    aws cloudformation deploy --template-file hosting.yaml --stack-name ember-serverless-hosting --capabilities CAPABILITY_IAM

Once this completes, get the outputs from the template:

    aws cloudformation describe-stacks --stack-name ember-serverless-hosting

Note the `OutputValue` value for the `CodeBucketName` S3 bucket, this will be the bucket we use to deploy our Lambda code to. Now create the API using the included deploy script to package and deploy the Lambda code, API Gateway, and DynamoDB table:

    ./deploy.sh --stack-name ember-serverless-api --template api.yaml --bucket <<bucket-name-from-above-output>>

This will package the api.yaml template file and output an `api-deploy.yaml` file. This file will contain the S3 location of the automatically packaged Lambda code and template. It will then deploy the CloudFormation stack by creating a changeset. Once complete, run describe again to see the outputs:

    aws cloudformation describe-stacks --stack-name ember-serverless-api

Note the `Outputs` which will contain your newly created API Gateway REST URL which will be used to CRUD DyanmoDB items. Now, go to the AWS API Gateway console and export the API Gateway JavaScript SDK for your newly created API.  

 1. Visit the AWS API Gateway Console
 2. Click on Stages -> Prod
 3. Click on SDK
 4. Choose JavaScipt
 5. Extract the archive to the client/vendor folder. The client/vendor folder should now contain a `apiGateway-js-sdk` folder.

### Create and Configure Cognito User Pools

Go to the AWS Cognito Console and choose User Pools and “Create a User Pool”. 

1.	Name the User Pool “EmberServerless” 
2.	Click “Review defaults”
3.	Click on “Add client…” then click “Add an App”. 
4.	For App name enter “EmberServerlessWebApp”, Uncheck “Generate Client Secret” 
5.	Click Add App, then Save Changes (Note the App Client ID)
6.	Click Create Pool

Note the Pool ID value, and click on “Federated Identities” in the top left of the menu bar. 

1.	Click on Create new Identity Pool
2.	Enter “EmberServerless” for the identity pool name
3.	Check “Enable access to unauthenticated identities”
4.	Click on “Authentication Providers” 
5.	Enter the User Pool ID noted above and the App Client ID
6.	Click Create Pool 
7.	Note the IAM Role name, and click Allow

On the next screen you don’t need to download anything as we’ve already added the JavaScript SDK with bower. However, note the “IdentityPoolId” in the sample code, we will need this in our ember app initializer.

Next let’s configure the IAM role that was created for the Cognito Identity pool so that it has permission to invoke API Gateway. 

1.	Go to the IAM console
2.	Click on Roles
3.	Find the Authenticated Role that was created in step 7 above, it should be called something like “Cognito_EmberServerlessAuth_Role”
4.	Click on Attach Policy
5.	Type “APIGateway” into the filter and choose the “AmazonAPIGatewayInvokeFullAccess” Policy
6.	Click on Attach Policy

The authenticated Cognito role now has access to invoke API Gateway APIs. 

### Update Client Environment Variables

Open up `client/config/environment.js` and add the following to the development section.

    if (environment === 'development') {
        ENV.AWS_REGION = ‘us-east-2’
	    ENV.AWS_POOL_ID = ‘us-east-2:unique-hash-id’
	    ENV.AWS_USER_POOL_ID = ‘us-east-2_unique-id’
	    ENV.AWS_CLIENT_ID = ‘unique-user-pool-app-id’
    }


### Deploying the Web Application

Now that the infrastructure is created, build the ember app and copy it to S3, note you'll need the "WebsiteBucket" output value from the above hosting cloudformation stack you generated. If you need it again, just run `aws cloudformation describe-stacks --stack-name ember-serverless-hosting` *if you used a different name, substitute that in-place of "ember-serverless-hosting", then note the `OutputValue` for "WebsiteBucket" and use that here:

    cd client
    ember build
    aws s3 sync dist/ s3://<<your-ember-website-bucket>>/ -acl public-read

Once synced you can visit the URL for your S3 bucket using the `OutputValue` from the hosting template for "WebsiteURL". To update your bucket, just rerun the above commands.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* [aws-cli](https://aws.amazon.com/cli)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
