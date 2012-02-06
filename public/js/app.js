(function(){

  // Set blank object
  window.Pinned = {};

  // Set session default to false
  Pinned.status = false;

  // Set template helper
  Pinned.template = function(){
    var element = $("#" + arguments[0] + "-template"),
        data = typeof arguments[1] === "object" ? arguments[1] : {},
        onComplete = typeof arguments[2] === "function" ? arguments[2] : null,
        results = element.html(),
        i;

    for(i in data) {
      results = results.replace("{{" + (arguments[0] || "item") + "." + i + "}}", data[i]);
    };
    
    // return onComplete function with element, data, and markup
    return onComplete(results);
  };

  // Set initializer
  Pinned.init = function(){
    head.ready(function(){
      
      var body = $("body"), 
          content = body.find("#wrap .content");

      // Login
      if (!Pinned.status) {
        Pinned.template("login", {}, function(res){
          content.append(res);
        });
      };
      
      // Index
      if (Pinned.status) {
        $.ajax({
          url : "/pins",
          dataType : "json",
          success : function(res){

            var len = res.length,
                i = 0;

            for ( ; i < len; i++) {

              var item = res[i];
              var _time = new Date(item.saved);

              Pinned.template("pin", { 
                  domain : item.domain, 
                  title : item.title, 
                  href : item.href,
                  id: item._id,
                  target: "_blank",
                  image : item.image,
                  show : item.show,
                  date : $.timeago(_time)
                }, function(html){
                  content.append(html);
              });

            };

            content.masonry({
              isFitWidth: true,
              gutterWidth: 15,
              isResizable: true
            });

          }
        })
      };

    });
  };

  // Run app
  Pinned.init();

})();
