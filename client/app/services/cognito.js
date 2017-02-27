import Ember from 'ember';
import ENV from 'client/config/environment';

export default Ember.Service.extend({
	apig: Ember.inject.service(),
	authentication: Ember.inject.service(),
	identity: undefined, // cognito credential data
	id: undefined, // cognito identity id
	userPool: undefined, // cognito user pool
	user: undefined, // cognito user (if logged in with user pools)
	setIdentity(service,token) {
		var then = Ember.RSVP.defer(),
			apig = this.get('apig'),
			that = this;
		window.AWS.config.credentials.params.Logins = {};
   		window.AWS.config.credentials.params.Logins[service] = token;
   		window.AWS.config.credentials.params.expired = true;
   		window.AWS.config.credentials.get(function(err) {
   			if (err) {
   				Ember.Logger.error(err);
   				then.reject(err);
   			} else {
	   			var apigClient = window.apigClientFactory.newClient({
	              	'accessKey': window.AWS.config.credentials.accessKeyId,
	              	'secretKey': window.AWS.config.credentials.secretAccessKey,
	              	'sessionToken': window.AWS.config.credentials.sessionToken
	            });
	            apig.set('client',apigClient);
				Ember.set(that, 'id', window.AWS.config.credentials.data.IdentityId);
				Ember.set(that, 'identity', window.AWS.config.credentials.data);
				then.resolve();
			}
   		});
   		return then.promise;
	},
	clearIdentity(/*service*/) {
		var then = Ember.RSVP.defer(),
			user = this.get('user'),
			userPoolAuth = 'cognito-idp.'+ENV.region+'.amazonaws.com/'+ENV.userPoolId;
		if (typeof user !== 'undefined' && window.AWS.config.credentials.params.Logins[userPoolAuth]) {
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
	updateUserAttribute(attr,value) {
		var then = Ember.RSVP.defer(),
			cognitoUser = this.get('user'),
			attributeList = [],
			attribute = {
	        	'Name' : attr,
	        	'value' : value
	    	};

	    var cognitoAttribute = new window.AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(attribute);
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
	getUserAttributes() {
		var then = Ember.RSVP.defer(),
			user = this.get('user');
		user.getUserAttributes(function(err, result) {
	        if (err) {
	        	Ember.Logger.debug('getUserAttributes error: ', err);
	            then.reject(err);
	        } else {
	        	var data = {};
			    for (var i = result.length - 1; i >= 0; i--) {
			       data[result[i].Name] = result[i].Value;
			    }
	        	then.resolve(data);
	        }
	    });
	    return then.promise;
	},
	register(username,password) {
		var userPool = this.get('userPool'),
			then = Ember.RSVP.defer(),
			attributeList = [],
			dataEmail = {
	        	'Name': 'email',
	        	'Value': username
	    	};

	    var attributeEmail = new window.AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
	   	attributeList.push(attributeEmail);
	   	var that = this;
	   	userPool.signUp(username,password, attributeList, null, function(err,result) {
	   		if (err) {
	   			console.error(err);
	   			then.reject(err);
	   		} else {
	   			Ember.set(that,'user',result.user);
	   			then.resolve(result);
	   		}
	   	});
		return then.promise;
	},
	resendConfirmation(username) {
		var then = Ember.RSVP.defer(),
			userPool = this.get('userPool'),
			userData = {
	        	'Username' : username,
	        	'Pool' : userPool
	    	};

	    var cognitoUser = new window.AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
		cognitoUser.resendConfirmationCode(function(err, result) {
           if (err) {
        		then.reject(err);
           } else {
           		then.resolve(result);
           }
        });
        return then.promise;
	},
	confirm(username,code) {
		var then = Ember.RSVP.defer(),
			userPool = this.get('userPool'),
			userData = {
	        	'Username' : username,
	        	'Pool' : userPool
	    	};

	    var cognitoUser = new window.AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
	    cognitoUser.confirmRegistration(code, true, function(err, result) {
	        if (err) {
	            then.reject(err);
	        } else {
	        	then.resolve(result);
	        }
	    });
		return then.promise;
	},
	authenticate(username,password) {
		var then = Ember.RSVP.defer(),
			authenticationData = {
	        	'Username' : username,
	        	'Password' : password,
	    	},
	    	authenticationDetails = new window.AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData),
	    	userPool = this.get('userPool'),
	    	userData = {
	        	'Username' : username,
	        	'Pool' : userPool
	    	};

	    var cognitoUser = new window.AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
	    cognitoUser.authenticateUser(authenticationDetails, {
	        onSuccess: function (/*result*/) {
	        	then.resolve(cognitoUser);
	        },
	        onFailure: function(err) {
	            Ember.Logger.error('onFailure: ', err);
	            then.reject(err);
	        },
	    });
	    return then.promise;
	}
});