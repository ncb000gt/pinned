'use strict';

!function() {
  Pinned.collections.Pins = Backbone.Collection.extend({
    "url": '/api/pins',
    "parse": function(resp) {
      this.totalPages = Math.ceil(resp.total / this.perPage);

      return resp.results;
    }
  });

  Pinned.views.Pin = Backbone.View.extend({
    "className": 'pin',
    "template": 'pin',
    "render": function() {
      var self = this;

      Pinned.loadTemplate(self.template, function(tmpl) {
        self.$el.html(tmpl(self.model.toJSON()));
        self.trigger('rendered', self.$el);
      });
    }
  });

  Pinned.views.PinList = Backbone.View.extend({
    "initialize": function() {
      this.offset = 0;
      this.size = 10;

      this.collection = new Pinned.collections.Pins({
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
      var pin = new Pinned.views.Pin({
        "model": model
      });
      pin.bind('rendered', function($pin) {
        self.$el.prepend($pin);
      });
      pin.render();
    }
  });
}();
