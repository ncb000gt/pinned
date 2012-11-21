'use strict';

var Pinned = {
  "collections": {},
  "views": {},
  "templates": {},
  "loadTemplateAsync": function(name) {
    console.log('load: ' + name);
    if (!(name in Pinned.templates)) Pinned.templates[name] = $.get('/html/'+name+'.html');

    return Pinned.templates[name];
  },
  "loadTemplate": function(name, cb) {
    return Pinned.loadTemplateAsync(name).done(function(tmpl) {
      if (cb) return cb(function(data) {
        return Mustache.render(tmpl, data);
      });
    });
  }
};

