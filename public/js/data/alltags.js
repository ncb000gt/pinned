'use strict';

define(['backbone'], function(Backbone, undefined) {
  return Backbone.Collection.extend({
    "url": function() {
      return "/api/tags";
    }
  });
});
