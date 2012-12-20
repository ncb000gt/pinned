'use strict';

define(['underscore', 'jquery', 'backbone', 'bootstrap', 'mustache', 'modals/index', 'text!views/tag-modal.html', 'tag', 'data/alltags'], function(_, $, Backbone, Bootstrap, Mustache, ModalView, tmpl, Tag, AllTags, undefined) {
	window.bstrap = Bootstrap;
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
      this.tagCollection.bind('reset', this.fetchAllTags, this);
      this.tagCollection.bind('add', this.add, this);
    },
		"postRender": function() {
			this.input = this.$el.find('input');
			this.pinTags = this.$el.find('.pin-tags');

			this.input.typeahead({
				source: $.proxy(this.tagNames, this)
			});

			this.collection.fetch();
			this.tagCollection.fetch();
		},
		"tagNames": function() {
			return this.collection.pluck('name');
		},
		"fetchAllTags": function() {
			this.collection.fetch();
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
			var self = this;
			var name = self.input.val().toLowerCase();
			if (name === '') return;

			var found = false;
			_.each(self.tagCollection.models, function(m) {
				if (m.get('name') === name) found = true;
			});

			self.input.val('');
			if (found) return;

      self.tagCollection.create({
				"id": name,
				"name": name
      }, {
				"wait": true,
				"success": function(model, res) {
					self.collection.fetch();
				}
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
