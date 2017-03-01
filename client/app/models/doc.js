import DS from 'ember-data';
import attr from 'ember-data/attr';

/**
 * This local model coorisponds to items
 * within the DynamoDB table. If more properties
 * are added, the model needs to have the attributes
 * defined here in order for them to be exposed
 * in view templates
 */
export default DS.Model.extend({
	content: attr('string')
});
