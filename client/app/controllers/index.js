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

export default Ember.Controller.extend({
	cognito: Ember.inject.service(),
	authentication: Ember.inject.service(),
	jwt: Ember.computed('authentication', function() {
		var token = this.get('authentication').get('token');
		return window.jwt_decode(token);
	}),
	user: Ember.computed('cognito', function() {
		return this.get('cognito').get('user');
	}),
	actions: {
		createItem() {
			let content = this.get('item');
			if (!content) {
				return alert('Please enter some content');
			}
			let	doc = this.get('store').createRecord('doc', {
					'content': content
				});
			doc.save()
				.then(function(data) {
					Ember.Logger.info(data);
				})
				.catch(function(error) {
					Ember.Logger.error(error);
					doc.deleteRecord();
				});
		},
		removeItem(id) {
			if (confirm('Remove this item?')) {
				this.get('store').findRecord('doc', id, { backgroundReload: false })
					.then(function(doc) {
						doc.deleteRecord();
						doc.save();
					})
					.catch(function(err) {
						Ember.Logger.error(err);
					});
			}
		},
		logout() {
			var ctrl = this;
			this.get('authentication').logout()
				.then(function() {
					ctrl.transitionToRoute('/login');
				});
		}
	}
});
