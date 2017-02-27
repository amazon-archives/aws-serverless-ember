import Ember from 'ember';

export default Ember.Controller.extend({
	cognito: Ember.inject.service(),
	user: Ember.computed('cognito', function() {
		return this.get('cognito').get('user');
	}),
	actions: {
		createDoc() {
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
					alert(error);
				});
		}
	}
});
