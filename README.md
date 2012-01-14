pinned
===========

Bookmarking applications suck. As it stands now, there isn't much overhead involved with the bookmarking side of things, but there is a massive overhead associatedd with returning to actually read what you've marked. Often we don't want to distract outselves and bookmarking is a great way to setup your "read later" list. The problem is that "read later" lists tend to grow over time and then become so large that you feel a need to declare bankruptcy. This isn't good for anyone.

This application aims to fix this problem, but also a few others.


You want to use this? LAWLZ
===========

This is still _very much_ a work in progress. The current datastore and api could change without warning. Please keep that in mind if you do plan to use this. Also, it has many rought edges. Data could disappear or things could not work. However, if you do find any issues please file tickets.

You've been warned.


How to Use
===========

Pinned is self hosted (at the moment). You need to obtain the source, obtain the datastore, install other dependencies, and run.

* Get and install NodeJS
* `git clone git://github.com/ncb000gt/pinned.git`
* Get and install MongoDB
* `npm install .`
* Within the pinned directory: `scripts/build_templates`
** Host: You need to add `http` or `https` (however, the code currently doesn't check for https to use the appropriate module... *cough*)
** Password: For logging into the main app
** Authentication Phrase: This is for the bookmarklet when sending data back to the server. It's a _really_ minor security bit that is easy enough to get if someone wanted...
* Within the Pinned directory: `node app.js`


Contributors
===========

* [Erik Zettersten][erik5388]


License
===========

MIT unless otherwise stated inside the source files themselves.







[erik5388]:https://github.com/erik5388
