import Ember from 'ember';

export default Ember.Service.extend({
	cognito: Ember.inject.service(),
	authenticated: undefined,
	token: undefined,
	service: undefined,
	getProfile: function() {
		var then = Ember.RSVP.defer();
		if (typeof this.get('cognito').get('user') !== 'undefined') {
			this.get('cognito').getUserAttributes()
				.then(function(data) {
					Ember.Logger.debug('cognito profile data: ', data);
					var profile = {
						'attributes': data,
						'service': 'cognito'
					};
					then.resolve(profile);
				},function(err) {
					then.reject(err);
				});
		}
		return then.promise;
	},
	logout: function() {
		var cognito = this.get('cognito');
		var that = this;
		cognito.clearIdentity()
			.then(function() {
				that.reload();
			}, function(error) {
				Ember.Logger.error(error);
			});
	},
	reload: function() {
		window.location.reload();
	}
});