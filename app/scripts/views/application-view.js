/*global define*/

define(['jquery', 'underscore', 'backbone', 'templates', ], function($, _, Backbone, JST) {
    'use strict';
    var MILLIS_IN_SECOND = 1000,
        SECONDS_IN_MINUTE = 60,
        MINUTE_AS_MILLIS = MILLIS_IN_SECOND * SECONDS_IN_MINUTE,
        MINUTES_IN_HOUR = 60,
        HOURS_AS_MILLIS = MINUTE_AS_MILLIS * MINUTES_IN_HOUR,
        HOURS_IN_DAY = 24,
        DAY_AS_MILLIS = HOURS_AS_MILLIS * HOURS_IN_DAY,
        dateRegexp = new RegExp(/(\w+)\s+(\w+)\s+(\d+)\s+(\d{4})/),
        sourceRegexp = new RegExp(/&gt;(.*)&lt;/);
    var TweetView = Backbone.View.extend({
        template: JST['app/scripts/templates/tweet.ejs'],
        className: 'tweet',
        initialize: function( /*opts*/ ) {
            _.bindAll(this, 'render');
        },
        millisToNearestUnit: function(ms) {
            var secs, minutes, hours, days;
            //console.log(ms + 'ms');
            if (ms >= DAY_AS_MILLIS) {
                days = ms / DAY_AS_MILLIS;
                days = Math.floor(hours);
                return days + 'd';
            }
            if (ms >= HOURS_AS_MILLIS) {
                hours = (ms / HOURS_AS_MILLIS) % HOURS_IN_DAY;
                hours = Math.floor(hours);
                return hours + 'h';
            }
            if (ms >= MINUTE_AS_MILLIS) {
                minutes = (ms / MINUTE_AS_MILLIS) % MINUTES_IN_HOUR;
                minutes = Math.floor(minutes);
                return minutes + 'm';
            }
            if (ms >= MILLIS_IN_SECOND) {
                secs = (ms / MILLIS_IN_SECOND) % SECONDS_IN_MINUTE;
                secs = Math.floor(secs);
                return secs + 's';
            }
            return 'Just Now';
        },
        toJSON: function(model) {
            var json = model.toJSON();
            var date = new Date(json.created_at);
            var createdMs = date.getTime();
            var nowMs = Date.now();
            json.timesince = this.millisToNearestUnit(nowMs - createdMs);
            var timeStr = date.toLocaleTimeString().replace(/:\d{2} /, ' ');
            var dateArr = dateRegexp.exec(date.toDateString());
            json.created_at = timeStr + ' - ' + dateArr[3] + ' ' + dateArr[2] + ' ' + dateArr[4].substr(2, 4);
            // replace single quotes with html entity so you can use
            // it in title. Should also prevent escaping.
            json.text = json.text.replace(/'/g, '&#39;');
            json.source = sourceRegexp.exec(json.source)[1];
            return json;
        },
        render: function() {
            var json = this.toJSON(this.model);
            this.$el.html(this.template(json));
        }
    });
    var TweetAreaView = Backbone.View.extend({
        el: '.tweet-area',
        itemView: TweetView,
        removeCount: 5,
        initialize: function(opts) {
            this.viewModel = {};
            if (this.collection) {
                this.listenTo(this.collection, 'add', this.add, this);
            }
            if (opts && opts.addClazz) {
                this.addClazz = opts.addClazz;
            }
            _.bindAll(this, 'animateInsertion', 'cleanUpOldTweetViews');
        },
        animateInsertion: function($tweets, model) {
            $tweets.removeClass('slide-down1 animate0');
            var view = new this.itemView({
                attributes: {
                    'data-id': model.id
                },
                model: model
            });
            this.viewModel[model.id] = view;
            view.render();
            view.el.style.visibility = 'hidden';
            var fn = function() {
                    view.el.className = 'tweet';
                    console.log(view.el.className);
                };
            view.el.addEventListener('animationend', fn);
            view.el.addEventListener('webkitAnimationEnd', fn);
            view.el.style.visibility = 'visible';
            view.el.className = this.addClazz + ' animate0 tweet';
            this.$el.prepend(view.$el);
            setTimeout(this.cleanUpOldTweetViews, 0);
        },
        cleanUpOldTweetViews: function() {
            //console.time('cleaning up views')
            var tweets = this.el.getElementsByClassName('tweet');
            var len = tweets.length;
            if (len < this.removeCount) {
                //console.timeEnd('cleaning up views');
                return;
            }
            var id = tweets[len - 1].getAttribute('data-id');
            var view = this.viewModel[id];
            //console.log('at ' + len + ' removing ' + id);
            view.remove();
            view.model = null;
            delete this.viewModel[id];
            //console.timeEnd('cleaning up views');
        },
        add: function(model) {
            var d = $.Deferred();
            var $tweets = this.$('.tweet');
            if ($tweets.length) {
                var i, iMax;
                for (i = 0, iMax = $tweets.length; i < iMax; ++i) {
                    $tweets[i].className = 'tweet slide-down1 animate0';
                }
                var fn = function(el) {
                        d.resolve(el);
                    };
                $tweets[0].addEventListener('webkitAnimationEnd', fn);
                $tweets[0].addEventListener('animationend', fn);
            } else {
                d.resolve();
            }
            var p = d.promise();
            var self = this;
            p.done(function() {
                self.animateInsertion($tweets, model);
            });
        }
    });

    return {
        TweetView: TweetView,
        TweetAreaView: TweetAreaView
    };
});
