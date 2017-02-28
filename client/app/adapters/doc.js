import DS from 'ember-data';
import Ember from 'ember';

// @TODO 
// statusCode = 401 and message=Identity token has expired
// redirect to login

export default DS.Adapter.extend({
	apig: Ember.inject.service(),
	authentication: Ember.inject.service(), 
	findAll: function() {
		var token = this.get('authentication').get('token'),
			api = this.get('apig'),
			params = { 
				'user': token,
				'id': ''
			};
		return new Ember.RSVP.Promise(function(resolve,reject) {
			api.client.docsGet(params)
				.then(function(result) {
					Ember.Logger.debug('api response: ', result);
					Ember.run(null, resolve, result.data.body);
				}).catch(function(error) {
					Ember.Logger.error('api error: ', error);
					Ember.run(null, reject, error);
				});
		});
	},
	createRecord: function(store, type, snapshot) {
		var token = this.get('authentication').get('token'),
			data = this.serialize(snapshot, { includeId: true }),
			api = this.get('apig');
		return new Ember.RSVP.Promise(function(resolve,reject) {
			api.client.docsPost({'user':token},data).then(function(result) {
				Ember.Logger.debug('api response: ', result);
				if (result.data.statusCode !== 200) {
					Ember.run(null, reject, result.data.body);
				} else {
					Ember.run(null, resolve, result.data.body);
				}
			}).catch(function(error) {
				console.error(error);
				Ember.run(null, reject, error);
			});
		});
	},
	updateRecord: function(store, type, snapshot) {
		var data = this.serialize(snapshot, { includeId: true }),
			api = this.get('apig');
		return new Ember.RSVP.Promise(function(resolve,reject) {
			var id = data.id;
			api.client.docsPost({'id':id},data).then(function(result) {
				Ember.Logger.debug('api: ', result);
				Ember.run(null, resolve, result);
			}).catch(function(error) {
				console.error(error);
				Ember.run(null, reject, error);
			});
		});
	},
	deleteRecord: function(store, type, snapshot) {
		var data = this.serialize(snapshot, { includeId: true }),
			api = this.get('apig'),
			token = this.get('authentication').get('token'),
			params = { 
				'user': token
			};
		return new Ember.RSVP.Promise(function(resolve,reject) {
			api.client.docsDelete(params,data).then(function(result) {
				Ember.Logger.debug('api: ', result);
				if (result && result.data && result.data.errorType && result.data.errorMessage) {
					Ember.run(null, reject, result.data.errorMessage);
				} else {
					Ember.run(null, resolve, result.config.data);
				}
			}).catch(function(error) {
				Ember.Logger.error('deleteRecord failed in adapter: ', error);
				Ember.run(null, reject, error);
			});
		});
	}
});
