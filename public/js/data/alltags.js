'use strict';

var AllTags = null;

define(['backbone'], function(Backbone, undefined) {
	if (!AllTags) {
		AllTags = new (Backbone.Collection.extend({
			"url": function() {
				return "/api/tags";
			}
		}))();
	}

	return AllTags;
});
