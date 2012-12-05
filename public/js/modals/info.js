'use strict';

define(['modals/index', 'mustache', "text!views/info-modal.html"], function(ModalView, Mustache, tmpl, undefined) {
  return ModalView.extend({
    "events": {
      "click .cancel": "hide",
    },
    "modalData": function() {
      return {
        "title": "Pin Info",
        "body": Mustache.render(tmpl, this.model.toJSON()),
        "buttons": [
          { "class": 'cancel', "title": 'Close' }
        ]
      };
    }
  });
});
