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
import DS from 'ember-data';
import Ember from 'ember';

// @TODO 
// statusCode = 401 and message=Identity token has expired
// redirect to login

/**
 * Ember adapter to handle interaction with API Gateway
 * https://guides.emberjs.com/v2.11.0/models/customizing-adapters/
 * 
 * API Gateway uses Cognito User Pools for authentication. The 
 * authentication service is used to provide the token which is
 * provided in the header 'user' property which is set within 
 * API Gateway.
 */
export default DS.Adapter.extend({
	apig: Ember.inject.service(),
	authentication: Ember.inject.service(), 
	findAll: function() {
		let token = this.get('authentication').get('token'),
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
		let token = this.get('authentication').get('token'),
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
		let data = this.serialize(snapshot, { includeId: true }),
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
		let data = this.serialize(snapshot, { includeId: true }),
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
