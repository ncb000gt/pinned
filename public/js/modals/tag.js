'use strict';

define(['underscore', 'modals/index', 'mustache', 'text!views/tag-modal.html', 'text!views/tag.html', 'backbone', 'data/alltags'], function(_, ModalView, Mustache, tmpl, tagTmpl, Backbone, AllTags, undefined) {
  var PinTags = Backbone.Collection.extend({
    "url": function() {
      return "/api/" + this.pin + "/tags";
    }
  });

  return ModalView.extend({
    "events": {
      "click .cancel": "hide",
      "click .add": "addTag",
			"keypress input": "checkSubmit",
			"click i": "removeTag"
    },
    "postInit": function() {
			this.collection = new AllTags();
      this.tagCollection = new PinTags();
			this.tagCollection.pin = this.model.get('id');
      this.tagCollection.bind('reset', this.listTags, this);
      this.tagCollection.bind('add', this.add, this);
			this.tagCollection.bind('remove', this.remove, this);
    },
		"postRender": function() {
			this.input = this.$el.find('input');
			this.pinTags = this.$el.find('.pin-tags');

			this.collection.fetch();
			this.tagCollection.fetch();
		},
    "modalData": function() {
      return {
        "title": "Tags",
        "body": Mustache.render(tmpl, this.model.toJSON()),
        "buttons": [
          { "class": 'cancel', "title": 'Close' }
        ]
      };
    },
		"checkSubmit": function(e) {
			if (e && e.keyCode === 13) {
				this.addTag();
			}
		},
    "addTag": function() {
			var name = this.input.val().toLowerCase();
			var found = false;
			_.each(this.tagCollection.models, function(m) {
				if (m.get('name') === name) found = true;
			});

			this.input.val('');
			if (found) return;

      this.tagCollection.create({
				"id": name,
				"name": name
      });
    },
    "add": function(model) {
      this.pinTags.append(
					Mustache.render(tagTmpl, model.toJSON()));
    },
		"removeTag": function(e) {
			var self = this;
			if (e) e.preventDefault();

			var name = $(e.target).data('name');
			_.each(self.tagCollection.models, function(m) {
				if (m && m.get('name') === name) {
					m.destroy();
				}
			});
		},
    "remove": function(model) {
			this.$el.find('#tag_' + model.get('name')).remove();
    },
    "listTags": function() {
			this.pinTags.find('span').remove();
			_.each(this.tagCollection.models, $.proxy(this.add, this));
    }
  });
});
