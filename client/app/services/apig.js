import Ember from 'ember';

/**
 * Holds a reference to the API Gateway client
 * that is initialized by the AWS initializer
 */
export default Ember.Service.extend({
	client: undefined
});
