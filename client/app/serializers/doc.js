import JSONSerializer from 'ember-data/serializers/json';

export default JSONSerializer.extend({
	normalizeDeleteRecordResponse(store, primaryModelClass, payload, id, requestType) {
		payload = payload.Attributes;
  		return this._super(store, primaryModelClass, payload, id, requestType);
  	}
});
