'use strict';

define(['modals/index', 'mustache', "text!views/delete-modal.html"], function(ModalView, Mustache, tmpl, undefined) {
  return ModalView.extend({
    "events": {
      "click .cancel": "hide",
      "click .delete": "delete"
    },
    "modalData": function() {
      return {
        "title": "Delete Pin",
        "body": Mustache.render(tmpl, {}),
        "buttons": [
          { "class": 'cancel', "title": 'Cancel' },
          { "class": 'btn-danger delete', "title": 'Delete' }
        ]
      };
    },
    "delete": function() {
      this.trigger('delete', this.model);
      this.$el.modal('hide');
    }
  });
});
