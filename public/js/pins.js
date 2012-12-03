'use strict';

define(['underscore', 'jquery', "jquery-ui", 'backbone', "mustache", "text!views/pin.html", "text!views/delete-modal.html"], function(_, $, _jqui, Backbone, Mustache, pinTmpl, deleteModalTmpl, undefined) {
  var Pins = Backbone.Collection.extend({
    "url": '/api/pins',
    "parse": function(resp) {
      this.totalPages = Math.ceil(resp.total / this.perPage);

      return resp.results;
    }
  });

  var DeleteModal = Backbone.View.extend({
    "className": "modal fade hide",
    "events": {
      "click .cancel": "cancel",
      "click .delete": "delete"
    },
    "initialize": function() {
      this.render();
    },
    "render": function() {
      this.$el.html(Mustache.render(deleteModalTmpl, {}));
      this.show();
    },
    "show": function() {
      this.$el.modal('show');
    },
    "hide": function() {
      this.$el.modal('hide');
    },
    "cancel": function() {
      this.$el.modal('hide');
    },
    "delete": function() {
      this.trigger('delete', this.model);
      this.$el.modal('hide');
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
    },
    "showTag": function(e) {
      var self = this;
      if (e && e.target) e.preventDefault();
    },
    "showDelete": function(e) {
      var self = this;
      if (e && e.target) e.preventDefault();

      var deleteModal = new DeleteModal({
        "model": self.model
      });
      deleteModal.bind('delete', function() {
        self.delete();
      });
    },
    "delete": function() {
      this.model.destroy();
      this.trigger('delete', this.model, this.$el);
    }
  });

  var PinList = Backbone.View.extend({
    "initialize": function() {
      this.offset = 0;
      this.size = 10;

      this.collection = new Pins({
        "model": Backbone.Model
      });
      this.collection.bind('reset', $.proxy(this.render, this));

      this.fetch();
    },
    "fetch": function(data) {
      this.collection.fetch({data: {offset: this.offset, size: this.size}});
    },
    "render": function() {
      var self = this;

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
        self.$el.prepend($pin);
      });
      pin.bind('delete', $.proxy(self.remove, self));
      pin.render();
    },
    "remove": function(model, $el) {
      this.collection.remove(model);
      $el.toggle('slide', {"direction": 'left'}, function() {
        console.log('test');
        $el.remove();
      });
    }
  });

  return PinList;
});
