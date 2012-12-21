'use strict';

define(['backbone', 'mustache', 'text!views/tag.html'], function(Backbone, Mustache, tagTmpl, undefined) {
	return Backbone.View.extend({
		"initialize": function() {
			if (this.options.removable) this.removable = true;
		},
		"render": function() {
			this.$el = $(Mustache.render(tagTmpl, this.model.toJSON()));
			if (this.removable) {
				this.$el.addClass('label-info');
				this.$el.find('i').removeClass('hide');
				this.$el.bind('click', $.proxy(this.remove, this));
			} else {
				this.$el.bind('click', $.proxy(this.selected, this));
			}

			return this.$el;
		},
		"remove": function(e) {
			if (e) e.preventDefault();

			this.model.destroy();
			this.$el.remove();
		},
		"selected": function(e) {
			if (e) e.preventDefault();

			this.$el.toggleClass('label-info');
			this.trigger('selection', this.model.get('name'));
		}
	});
});
