'use strict';

define(['underscore', 'modals/index', 'mustache', 'text!views/tag-modal.html', 'backbone', 'tag', 'data/alltags'], function(_, ModalView, Mustache, tmpl, Backbone, Tag, AllTags, undefined) {
  var PinTags = Backbone.Collection.extend({
    "url": function() {
      return "/api/" + this.pin + "/tags";
    }
  });

  return ModalView.extend({
    "events": {
      "click .cancel": "hide",
      "click .add": "addTag",
			"keypress input": "checkSubmit"
    },
    "postInit": function() {
			this.collection = AllTags;
      this.tagCollection = new PinTags();
			this.tagCollection.pin = this.model.get('id');
      this.tagCollection.bind('reset', this.listTags, this);
      this.tagCollection.bind('add', this.add, this);
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
			if (name === '') return;

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
			var tag = new Tag({
				"model": model,
				"removable": true
			});
      this.pinTags.append(tag.render());
    },
    "listTags": function() {
			this.pinTags.find('a').remove();
			_.each(this.tagCollection.models, $.proxy(this.add, this));
    }
  });
});
