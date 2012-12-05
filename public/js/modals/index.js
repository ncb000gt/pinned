'use strict';

define(['backbone', 'mustache', "text!views/modal.html"], function(Backbone, Mustache, tmpl, undefined) {
  return Backbone.View.extend({
    "className": "modal fade hide",
    "initialize": function() {
      this.render(this.modalData());
    },
    "render": function(data) {
      this.$el.html(Mustache.render(tmpl, data));
      this.show();
    },
    "show": function() {
      this.$el.modal('show');
    },
    "hide": function() {
      this.$el.modal('hide');
    },
  });
});
