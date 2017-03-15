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
