'use strict';

!function($, undefined){
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

  //$('.tags form').submit(function() {
    //var el = $(this);
    //var msg = el.find('.msg');
    //$.post(el.attr('action'), {tags: el.find('#tags').val()}, function(data) {
    //}).success(function() {
      //msg.text('Your tags were saved!');
      //msg.removeClass('error');
      //msg.toggleClass('success');
      //msg.toggleClass('hidden');
    //}).error(function() {
      //msg.text('There was a problem saving your tags!');
      //msg.removeClass('success');
      //msg.toggleClass('error');
      //msg.toggleClass('hidden');
    //}).complete(function() {
      //setTimeout(function() {
        //msg.toggleClass('hidden');
      //}, 3000);
    //});

    //return false;
  //});

  //$('a.delete').click(function() {
    //var el = $(this);
    //var url = el.attr('href');
    //var pinid = url.split('/')[2];
    //var deletediv = $('.pin-'+pinid+' .module-footer div.delete');
    //deletediv.toggleClass('hidden');
    //$('.pin-'+pinid+' .delete_yes').click(function() {
      //$.get(url, function(data) {
      //}).success(function() {
        //el.parents('.pin').toggleClass('hidden');
      //});
    //});
    //$('.pin-'+pinid+' .delete_no').click(function() {
      //deletediv.toggleClass('hidden');
    //});

    //return false;
  //});

  //$('a.tags').click(function() {
    //var el = $(this);
    //var url = el.attr('href');
    //var pinid = url.split('/')[2];
    //$('.pin-'+pinid+' .module-footer div.tags').toggleClass('hidden');

    //return false; 
  //});

  var pins = new Pinned.views.PinList({
    "el": $('#pins')
  });
}(jQuery);
