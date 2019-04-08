/*
* Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
* SPDX-License-Identifier: MIT-0
*/
import JSONSerializer from 'ember-data/serializers/json';

/**
 * The API Gateway service returns the old Dynamo Item with
 * the properties on payload.Attributes. Ember requires the 
 * old object (with ID) to be returned after a delete.
 */
export default JSONSerializer.extend({
	normalizeDeleteRecordResponse(store, primaryModelClass, payload, id, requestType) {
		payload = payload.Attributes;
  		return this._super(store, primaryModelClass, payload, id, requestType);
  	}
});
