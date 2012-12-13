'use strict';

define(["underscore", "backbone", "data/alltags", "tag"], function(_, Backbone, AllTags, Tag, undefined) {
	return Backbone.View.extend({
		"initialize": function() {
			this.collection = AllTags;
			this.collection.bind("reset", this.render, this);
			this.collection.bind("add", this.add, this);
			this.collection.bind("remove", this.remove, this);
			this.fetch();

			this.tags = {};
		},
		"fetch": function() {
			this.collection.fetch({data: {tags: this.tags}});
		},
		"render": function() {
			this.$el.find('a').remove();
			_.each(this.collection.models, $.proxy(this.add, this));
		},
		"add": function(model) {
			var tag = new Tag({
				"model": model
			});
			tag.bind('selection', $.proxy(this.selected, this));
			this.$el.append(tag.render());
		},
		"selected": function(name) {
			if (name in this.tags) {
				delete this.tags[name];
			} else {
				this.tags[name] = 1;
			}

			this.trigger('filter', _.keys(this.tags));
		}
	});
});
