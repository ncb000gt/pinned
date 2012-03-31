(function(){
  $('form input').each(function() {
    var item = $(this);
    var placeholder = item.val();
    item.focus(function() {
      if (item.val() == placeholder) item.val('');
    });
    item.blur(function() {
      if (item.val() == '') item.val(placeholder);
    });
  });
})();
