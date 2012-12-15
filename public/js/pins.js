'use strict';

define(['underscore', 'jquery', "jquery-ui", 'backbone', "mustache", 'modals/delete', 'modals/info', 'modals/tag', "text!views/pin.html"], function(_, $, _jqui, Backbone, Mustache, DeleteModal, InfoModal, TagModal, pinTmpl, undefined) {
  var Pins = Backbone.Collection.extend({
    "url": '/api/pins',
    "parse": function(resp) {
      this.totalPages = Math.ceil(resp.total / this.perPage);

      return resp.results;
    }
  });

  var Pin = Backbone.View.extend({
    "className": 'pin pull-left',
    "events": {
      "click .pin-extra": "toggleInner",
      "click .pin-moreinfo": "showMoreInfo",
      "click .pin-tag": "showTag",
      "click .pin-delete": "showDelete"
    },
    "render": function() {
      var self = this;

      self.$el.html(Mustache.render(pinTmpl, self.model.toJSON()));
      self.$infoEl = self.$el.find('.pin-info');
      self.$actionEl = self.$el.find('.pin-actions');
      self.$extraEl = self.$el.find('.pin-extra');
      self.trigger('rendered', self.$el);
    },
    "toggleInner": function(e) {
      var self = this;
      if (e && e.target) e.preventDefault();

      var i = self.$extraEl.find('i');
      if (self.$infoEl.css('display') === 'none') {
        self.$actionEl.toggle('slide', { "direction": "right"}, 300, function() {
          self.$infoEl.toggle('slide', { "direction": "left"}, 300);
        });

        i.removeClass('icon-chevron-right');
        i.addClass('icon-chevron-left');
      } else {
        self.$infoEl.toggle('slide', { "direction": "left"}, 300, function() {
          self.$actionEl.toggle('slide', { "direction": "right"}, 300);
        });

        i.removeClass('icon-chevron-left');
        i.addClass('icon-chevron-right');
      }
    },
    "showMoreInfo": function(e) {
      var self = this;
      if (e && e.target) e.preventDefault();

      new InfoModal({
        "model": self.model
      });
    },
    "showTag": function(e) {
      var self = this;
      if (e && e.target) e.preventDefault();

      new TagModal({
        "model": self.model
      });
    },
    "showDelete": function(e) {
      var self = this;
      if (e && e.target) e.preventDefault();

      new DeleteModal({
        "model": self.model
      })
        .bind('delete', function() {
          self.delete();
        });
    },
    "delete": function() {
      this.model.destroy();
      this.trigger('delete', this.model, this.$el);
    }
  });

  return Backbone.View.extend({
    "initialize": function() {
      this.offset = 0;
      this.size = 12;

      this.collection = new Pins({
        "model": Backbone.Model
      });
      this.collection.bind('reset', $.proxy(this.render, this));

      this.fetch();
    },
    "fetch": function(data) {
			if (!data) data = {};
			data.offest = data.offset || this.offset;
			data.size = data.size || this.size;
      this.collection.fetch({data: data});
    },
    "render": function() {
      var self = this;

			self.$el.find('div').remove();
      _.each(self.collection.models, function(model) {
        self.add(model);
      });
    },
    "add": function(model) {
      var self = this;
      var pin = new Pin({
        "model": model
      });
      pin.bind('rendered', function($pin) {
        self.$el.append($pin);
      });
      pin.bind('delete', $.proxy(self.remove, self));
      pin.render();
    },
    "remove": function(model, $el) {
      this.collection.remove(model);
      $el.toggle('slide', {"direction": 'left'}, function() {
        $el.remove();
      });
    }
  });
});
