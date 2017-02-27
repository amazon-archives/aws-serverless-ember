import Ember from 'ember';

export default Ember.Controller.extend({
	cognito: Ember.inject.service(),
	authentication: Ember.inject.service(),
	username: undefined,
	password: "",
	emailInvalid: true,
	passInvalid: true,
	confirmationSent: undefined,
	confirmationCode: "",
	confirmationEmail: undefined,
	confirmed: undefined,
  	passValid: Ember.computed('passValid', function() {
  		if (this.get('password').length <= 6) {
  			return true;
  		} else {
  			return false;
  		}
  	}),
	actions: {
		validateLoginEmail() {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    		var email = this.get('username');
    		if (re.test(email)) {
    			this.set('emailInvalid',false);
    		} else {
    			this.set('emailInvalid',true);
    		}
		},
		validateLoginPassword() {
			if (this.get('password').length <= 6) {
				this.set('passInvalid',true);
			} else {
				this.set('passInvalid',false);
			}
		},
		logout() {
			var auth = this.get('authentication');
				auth.logout();
		},
		login() {
			this.set('authenticating',true);
			this.set('error',undefined);
			var that = this;
			var username = this.get('username'),
				password = this.get('password'),
				auth = this.get('authentication');
			if (username && password) {
				var cognito = this.get('cognito');
					cognito.authenticate(username,password)
						.then(function(/*response*/) {
							auth.reload();
							//that.set('authenticating',false);
							//auth.set('authenticated', true);
							//Ember.Logger.debug('login with cognito succeeded.');
							//that.get('target').send('gotoSites');
						}, function(error) {
							that.set('error',error.toString().split(':')[1]);
							that.set('authenticating',false);
						});
			}
		},
		resendConfirmation() {
			this.set('resentConfirmation',undefined);
			var cognito = this.get('cognito'),
				email = this.get('confirmationEmail'),
				that = this;
			cognito.resendConfirmation(email)
				.then(function(data) {
					Ember.Logger.debug(data);
					Ember.set(that,'resentConfirmation',data);
				},function(err) {
					Ember.Logger.debug(err);
					Ember.set(that,'error',err);
				});
		},
		confirmRegistration() {
			var that = this;
			this.set('confirming',true);
			this.set('error',undefined);
			this.set('confirmed', undefined);
			var cognito = this.get('cognito'),
				email = this.get('confirmationEmail'),
				code = this.get('confirmationCode');
			cognito.confirm(email,code)
				.then(function(data) {
					Ember.Logger.debug(data);
					Ember.set(that,'confirming',undefined);
					Ember.set(that,'confirmationSent',undefined);
					Ember.set(that, 'confirmed', true);
				},function(err) {
					Ember.Logger.debug(err);
					Ember.set(that,'error',err);
					Ember.set(that,'confirming',undefined);
					Ember.set(that,'confirmed', undefined);
				});
		},
		register() {
			var that = this;
			this.set('authenticating',true);
			this.set('error',undefined);
			var password = this.get('password'),
				email  = this.get('username');
			var cognito = this.get('cognito');
			cognito.register(email,password)
				.then(function(response) {
					Ember.Logger.debug(response);
					that.set('authenticating',false);
					that.set('confirmationSent', true);
					that.set('confirmationEmail', email);
				}, function(error) {
					Ember.Logger.debug(error);
					that.set('authenticating',false);
					that.set('confirmationSent', true);
					var msgArray = error.toString().split(':');
					var message = "";
					for (var i = 1; i <= msgArray.length; i++) {
						if (msgArray[i] !== undefined) {
							message += msgArray[i] + '. ';
						}
					}
					that.set('error',message);
				});
		}
	}
});
