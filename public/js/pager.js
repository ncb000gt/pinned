'use strict';

define(['backbone'], function(Backbone, undefined) {
	return Backbone.View.extend({
		"events": {
			"click .previous a": "previous",
			"click .next a": "next"
		},
		"initialize": function() {
			var self = this;
			self.page = 0;
      self.offset = 0;
      self.size = 12;
			self.total = 0;

			if (self.collection) {
				self.collection.bind('reset', function() {
					self.pages = Math.ceil(self.collection.total / self.size);
					var next = self.$el.find('.next');
					var prev = self.$el.find('.previous');

					if (self.pages > 0 && (self.page+1) < self.pages) {
						if (next.hasClass('disabled')) next.removeClass('disabled');
					} else if (self.pages > 0 && (self.page+1) === self.pages) {
						if (!next.hasClass('disabled')) next.addClass('disabled');
					}

					if (self.pages > 0 && self.page > 0) {
						if (prev.hasClass('disabled')) prev.removeClass('disabled');
					} else if (self.pages > 0 && self.page === 0) {
						if (!prev.hasClass('disabled')) prev.addClass('disabled');
					}
				});
			}
		},
		"fetch": function() {
			if (this.collection) {
				var data = {
					"offset": this.offset,
					"size": this.size
				};

				this.collection.fetch({data: data});
			}
		},
		"previous": function(e) {
			if (e) e.preventDefault();

			if (this.page > 0) {
				if (this.page > 0 && this.offset > this.size) {
					this.offset -= this.size;
					this.page--;
				} else if (this.offset <= this.size) {
					this.offset = 0;
					this.page = 0;
				}

				this.fetch();
			}
		},
		"next": function(e) {
			if (e) e.preventDefault();
			
			if (this.pages > (this.page+1)) {
				this.offset += this.size;
				this.page++;

				this.fetch();
			}
		}
	});
});
