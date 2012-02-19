(function(){

  // Set blank object
  window.Pinned = {};

  // Set session default to false
  Pinned.status = false;

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
      
      /*
      * @description: Initialize application routes
      */
      Pinned.settings.routes();

    });
  };

  Pinned.application = {};
  Pinned.application.home = function(){

    if ( $(".content").data()["masonry"] ) delete $(".content").data()["masonry"];

    if (!Pinned.status) return Path.dispatch("#/login");

    $.ajax({
      "url" : "/pins",
      "dataType" : "json",
      "success" : function(res){

        $(".content").empty();

        var len = res.length,
            i = 0;

        for ( ; i < len; i++) {

          var item = res[i];
          var _time = new Date(item.created_on);

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
              $(".content").append(html);
          });

        };

        $(".content").masonry({
          isFitWidth: true,
          gutterWidth: 14,
          isResizable: true
        });

      }
    });

  };
  
  /*
  * @description: Show Login
  */
  Pinned.application.login = function(){
    return Pinned.template("login", {}, function(res){
        $(".content").empty().append(res);
    });
  };

  Pinned.application.logout = function(){

  };

  Pinned.application.register = function(){

    if (Pinned.status) return Path.dispatch("#/");

    return Pinned.template("register", {}, function(res){
        
        $(".content").empty().append(res);
        
        
        $(".register input[type=submit]").click(function(e){
          e.preventDefault();
          
          var username = $("input#username").val();
          var password = $("input#password").val();
          var confPassword = $("input#confPassword").val();
          var email = $("input#email").val();

          if ( username === "") return alert("Please enter a username");
          if ( email === "") return alert("Please enter an email");
          if ( password === "") return alert("Please enter a password");
          if ( password !== confPassword) return alert("Please make sure your password matches the 'confirm password'");

          $.ajax({
            "url" : "/register",
            "data" : {
              "username" : username,
              "email" : email,
              "password" : password
            }, 
            "type" : "post",
            "success" : function(res){
              window.location = '/';
            }
          });
        });

    });
  };

  Pinned.settings = {};
  Pinned.settings.routes = function(){
    
    /*
    * @description: Setting application root.
    */
    Path.root("#/");

    /*
    * @description: Home
    */
    Path.map("#/").to( Pinned.application.home );

    /*
    * @description: Logout
    */
    Path.map("#/logout").to( Pinned.application.logout );

    /*
    * @description: Login
    */
    Path.map("#/login").to( Pinned.application.login );

    /*
    * @description: Register
    */
    Path.map("#/register").to( Pinned.application.register );

    /*
    * @description: Listening.
    */
    return Path.listen();

  };

  // Run app
  Pinned.init();

})();
