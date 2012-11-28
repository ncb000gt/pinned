define(["modernizr", "jquery", "backbone", "bootstrap", "pins"], function(Modernizr, $, Backbone, Bootstrap, Pins, undefined) {
  return {
    "run": function() {
      //login forms
      $('form input').each(function() {
        var item = $(this);
        var placeholders = ['Username', 'Password', 'Tags'];
        var placeholder = item.val();
        item.focus(function() {
          if (placeholders.indexOf(item.val()) >= 0) item.val('');
        });
        item.blur(function() {
          if (item.val() == '') item.val(placeholder);
        });
      });

      var pins = new Pins({
        "el": $("#pins")
      });
    }
  };
});
