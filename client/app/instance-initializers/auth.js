/*
* Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
* SPDX-License-Identifier: MIT-0
*/
import Ember from 'ember';

export function initialize(appInstance) {
  let cognito = appInstance.lookup('service:cognito'),
  	  userPool = appInstance.lookup('cognito:userPool'),
  	  auth = appInstance.lookup('service:authentication'),
  	  apigService = appInstance.lookup('service:apig'),
  	  apigClient = appInstance.lookup('api:client'),
  	  session = appInstance.lookup('auth:session'),
  	  user = appInstance.lookup('cognito:user'),
      token = appInstance.lookup('auth:token');

  // check if we have an initial user populated by user pools
  if (typeof user !== 'undefined') {
    cognito.set('user', user);
    Ember.Logger.info('Cognito User initialized: ', user);
  }
   
  // check if we have a previous session that we've logged in
  if (typeof session !== 'undefined') {
    cognito.set('id',session.IdentityId);
    cognito.set('identity',session);
    auth.set('authenticated',true);
  }

  if (typeof token !== 'undefined') {
    auth.set('token', token);
  }
  
  // if we have a user pool 
  if (typeof userPool !== 'undefined') {
    cognito.set('userPool', userPool);
  }
  
  // inject our api gateway client
  if (typeof apigClient !== 'undefined') {
    apigService.set('client',apigClient);
    Ember.Logger.info('API Gateway client initialized: ', apigClient);
  }

}

export default {
  name: 'auth',
  initialize
};
