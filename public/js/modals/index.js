'use strict';

define(['backbone', 'mustache', "text!views/modal.html"], function(Backbone, Mustache, tmpl, undefined) {
  return Backbone.View.extend({
    "className": "modal fade hide",
    "initialize": function() {
      if (this.postInit) this.postInit();
      this.render(this.modalData());
    },
    "render": function(data) {
      this.$el.html(Mustache.render(tmpl, data));
      this.show();
			if (this.postRender) this.postRender();
    },
    "show": function() {
      this.$el.modal('show');
    },
    "hide": function(e) {
			if (e) e.preventDefault();

      this.$el.modal('hide');
    }
  });
});
