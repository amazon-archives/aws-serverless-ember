/*
* Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
* Licensed under the Amazon Software License (the "License").
* You may not use this file except in compliance with the License.
* A copy of the License is located at
*
*   http://aws.amazon.com/asl/
*
* or in the "license" file accompanying this file. This file is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied.
* See the License for the specific language governing permissions and limitations
* under the License.
*/
import Ember from 'ember';
import ENV from 'client/config/environment';

/**
 * Handles and stores Cognito properties
 * and provides methods to interact with
 * Cognito User Pools and Identity
 */
export default Ember.Service.extend({
	apig: Ember.inject.service(),
	authentication: Ember.inject.service(),
	identity: undefined, // cognito credential data
	id: undefined, // cognito identity id
	userPool: undefined, // cognito user pool
	user: undefined, // cognito user (if logged in with user pools)
	/**
	 * Sets the identity token for a server
	 * @param service - service to set i.e. graph.facebook.com
	 * @param token - identity token from the provider
	 * 
	 * @returns promise [ null || error ]
	 */
	setIdentity(service,token) {
		let then = Ember.RSVP.defer(),
			apig = this.get('apig'),
			cognito = this,
			user = this.get('user'),
			auth = this.get('authentication');
		
		window.AWS.config.credentials.params.Logins = {};
		window.AWS.config.credentials.params.Logins[service] = token;

		// if we've already authenticated with user pools
		if ( typeof user !== 'undefined' ) {
			let params = {
				'IdentityPoolId': ENV.AWS_POOL_ID
			};
			window.AWS.config.credentials = new window.AWS.CognitoIdentityCredentials(params);
			window.AWS.config.credentials.get(function(err) {
				if (err) {
					Ember.Logger.error('credentials get error: ', err);
					then.reject(err);
				} else {
					var apigClient = window.apigClientFactory.newClient({
						'accessKey': window.AWS.config.credentials.accessKeyId,
						'secretKey': window.AWS.config.credentials.secretAccessKey,
						'sessionToken': window.AWS.config.credentials.sessionToken
					});
					Ember.Logger.info('AWS SDK Initialized, Registering API Gateway Client');
					Ember.set(apig, 'client', apigClient);
					Ember.set(cognito, 'id', window.AWS.config.credentials.data.IdentityId);
					Ember.set(cognito, 'identity', window.AWS.config.credentials.data);
					Ember.set(auth, 'token', token);
					then.resolve();
				}
			});
		} else if (service) {
			window.AWS.config.credentials.params.expired = true;
			window.AWS.config.credentials.get(function(err) {
				if (err) {
					Ember.Logger.error(err);
					then.reject(err);
				} else {
					let apigClient = window.apigClientFactory.newClient({
						'accessKey': window.AWS.config.credentials.accessKeyId,
						'secretKey': window.AWS.config.credentials.secretAccessKey,
						'sessionToken': window.AWS.config.credentials.sessionToken
					});
					apig.set('client',apigClient);
					cognito.set('id',window.AWS.config.credentials.data.IdentityId);
					cognito.set('identity',window.AWS.config.credentials.data);
					then.resolve();
				}
			});
		}
   		return then.promise;
	},
	/**
	 * Clears an identity from local cache and logs
	 * the user out
	 * @param service - optional service to define the service being used i.e. graph.facebook.com
	 * will use User Pools by default
	 * 
	 * @returns promise [ result || error ]
	 */
	clearIdentity(/*service*/) {
		let then = Ember.RSVP.defer(),
			user = this.get('user'),
			userPoolAuth = 'cognito-idp.'+ENV.AWS_REGION+'.amazonaws.com/'+ENV.AWS_USER_POOL_ID;
			Ember.Logger.info('userPoolAuth: ', userPoolAuth);
			Ember.Logger.info('user: ', user);
		if (typeof user !== 'undefined') {
			Ember.Logger.info('Logging out of User Pools');
			window.AWS.config.credentials.clearCachedId();
			user.signOut();
			then.resolve();
		} else {
			window.AWS.config.credentials.clearCachedId();
			window.AWS.config.credentials.params.expired = true;
			window.AWS.config.credentials.get(function(err,result){
				if (err) {
					console.error(err);
					then.reject(err);
				} else {
					then.resolve(result);
				}
			});
		}

		return then.promise;
	},
	/**
	 * Update a Cognito User Pools user's attributes
	 * @param attr - Attribute to update
	 * @param value
	 * 
	 * @returns promise [ result || error ]
	 */
	updateUserAttribute(attr,value) {
		let then = Ember.RSVP.defer(),
			cognitoUser = this.get('user'),
			attributeList = [],
			attribute = {
	        	'Name' : attr,
	        	'value' : value
	    	},
			cognitoAttribute = new window.AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(attribute);

	    attributeList.push(cognitoAttribute);
	    cognitoUser.updateAttributes(attributeList, function(err, result) {
	        if (err) {
	            then.reject(err);
	        } else {
	        	then.resolve(result);
	        }
	    });
	    return then.promise;
	},
	/**
	 * Retrieves the logged in Cognito User Pools user's attributes
	 * 
	 * @returns promise [ error || data ]
	 */
	getUserAttributes() {
		let then = Ember.RSVP.defer(),
			user = this.get('user');
		user.getUserAttributes(function(err, result) {
	        if (err) {
	        	Ember.Logger.debug('getUserAttributes error: ', err);
	            then.reject(err);
	        } else {
	        	let data = {};
			    for (let i = result.length - 1; i >= 0; i--) {
			       data[result[i].Name] = result[i].Value;
			    }
	        	then.resolve(data);
	        }
	    });
	    return then.promise;
	},
	/**
	 * Registers a user with Cognito User Pools
	 * 
	 * @param username - String
	 * @param password - String
	 * 
	 * @returns promise [ result || error ]
	 */
	register(username,password) {
		let userPool = this.get('userPool'),
			then = Ember.RSVP.defer(),
			attributeList = [],
			dataEmail = {
	        	'Name': 'email',
	        	'Value': username
	    	},
			service = this,
			attributeEmail = new window.AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
		attributeList.push(attributeEmail);
	   	userPool.signUp(username,password, attributeList, null, function(err,result) {
	   		if (err) {
	   			console.error(err);
	   			then.reject(err);
	   		} else {
	   			Ember.set(service,'user',result.user);
	   			then.resolve(result);
	   		}
	   	});
		return then.promise;
	},
	/**
	 * Resend a confirmation code
	 * @param username - Cognito User Pools username
	 * 
	 * @returns promise [ result || error ]
	 */
	resendConfirmation(username) {
		let then = Ember.RSVP.defer(),
			userPool = this.get('userPool'),
			userData = {
	        	'Username' : username,
	        	'Pool' : userPool
	    	},
			cognitoUser = new window.AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
		
		cognitoUser.resendConfirmationCode(function(err, result) {
           if (err) {
        		then.reject(err);
           } else {
           		then.resolve(result);
           }
        });
        return then.promise;
	},
	/**
	 * Confirm a user account with the Confirmation code
	 * sent with Cognito User Pools
	 * 
	 * @param username
	 * @param code
	 * 
	 * returns promise [ result || error ]
	 */
	confirm(username,code) {
		let then = Ember.RSVP.defer(),
			userPool = this.get('userPool'),
			userData = {
	        	'Username' : username,
	        	'Pool' : userPool
	    	},
			cognitoUser = new window.AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
	    
		cognitoUser.confirmRegistration(code, true, function(err, result) {
	        if (err) {
	            then.reject(err);
	        } else {
	        	then.resolve(result);
	        }
	    });
		return then.promise;
	},
	/**
	 * Authenticate a user against Cognito User Pools
	 * @param username
	 * @param password
	 * 
	 * @returns promise [ cognito user || error ]
	 */
	authenticate(username,password) {
		let then = Ember.RSVP.defer(),
			authenticationData = {
	        	'Username' : username,
	        	'Password' : password,
	    	},
	    	authenticationDetails = new window.AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData),
	    	userPool = this.get('userPool'),
	    	userData = {
	        	'Username' : username,
	        	'Pool' : userPool
	    	},
			auth = this.get('authentication'),
			cognito = this,
			userPoolAuth = 'cognito-idp.'+ENV.AWS_REGION+'.amazonaws.com/'+ENV.AWS_USER_POOL_ID,
			cognitoUser = new window.AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
	    
		cognitoUser.authenticateUser(authenticationDetails, {
	        onSuccess: function (result) {
				Ember.set(cognito,'user',cognitoUser);
				cognito.setIdentity(userPoolAuth,result.getIdToken().getJwtToken())
					.then(function() {
						auth.set('authenticated', true);
	        			then.resolve(cognitoUser);
					}, function(err) {
						then.reject(err);
					});
	        },
	        onFailure: function(err) {
	            Ember.Logger.error('onFailure: ', err);
	            then.reject(err);
	        },
	    });
	    return then.promise;
	}
});