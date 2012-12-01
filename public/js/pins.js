'use strict';

define(['underscore', 'jquery', 'backbone', "mustache", "text!views/pin.html"], function(_, $, Backbone, Mustache, pinTmpl, undefined) {
  var Pins = Backbone.Collection.extend({
    "url": '/api/pins',
    "parse": function(resp) {
      this.totalPages = Math.ceil(resp.total / this.perPage);

      return resp.results;
    }
  });

  var Pin = Backbone.View.extend({
    "className": 'pin pull-left',
    "render": function() {
      var self = this;

      self.$el.html(Mustache.render(pinTmpl, self.model.toJSON()));
      self.trigger('rendered', self.$el);
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
      console.log('render');
      var self = this;

      _.each(self.collection.models, function(model) {
        self.add(model);
      });
    },
    "add": function(model) {
      console.log('add');
      var self = this;
      var pin = new Pin({
        "model": model
      });
      pin.bind('rendered', function($pin) {
        self.$el.prepend($pin);
      });
      pin.render();
    }
  });

  return PinList;
});
