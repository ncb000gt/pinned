requirejs.config({
	"waitSeconds": 15,
  "baseUrl": "../js",
  "paths": {
    "bootstrap": "//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.2.1/bootstrap.min",
    "jquery": "//cdnjs.cloudflare.com/ajax/libs/jquery/1.8.3/jquery.min",
    "jquery-ui": "//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.9.1/jquery-ui.min",
    "underscore": "//cdnjs.cloudflare.com/ajax/libs/lodash.js/0.10.0/lodash.min",
    "backbone": "//cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.2/backbone-min",
    "modernizr": "//cdnjs.cloudflare.com/ajax/libs/modernizr/2.6.2/modernizr.min",
    "mustache": "//cdnjs.cloudflare.com/ajax/libs/mustache.js/0.7.0/mustache.min",
    "app": "main"
  },
  "shim": {
    "bootstrap": {
      "deps": ["jquery"],
      "exports": "Bootstrap"
    },
    "backbone": {
      "deps": ["underscore", "jquery"],
      "exports": "Backbone"
    },
    "pins": ["mustache"]
  }
});

require(["app"], function(app) {
  app.run();
});
