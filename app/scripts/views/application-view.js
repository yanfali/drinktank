/*global define*/

define(['jquery', 'underscore', 'backbone', 'templates', ], function($, _, Backbone, JST) {
    'use strict';
    /*
     *
     * Module Pattern Constants.
     *
     */
    var MILLIS_IN_SECOND = 1000,
        SECONDS_IN_MINUTE = 60,
        MINUTE_AS_MILLIS = MILLIS_IN_SECOND * SECONDS_IN_MINUTE,
        MINUTES_IN_HOUR = 60,
        HOURS_AS_MILLIS = MINUTE_AS_MILLIS * MINUTES_IN_HOUR,
        HOURS_IN_DAY = 24,
        DAY_AS_MILLIS = HOURS_AS_MILLIS * HOURS_IN_DAY,
        dateRegexp = new RegExp(/(\w+)\s+(\w+)\s+(\d+)\s+(\d{4})/),
        sourceRegexp = new RegExp(/&gt;(.*)&lt;/);

    /*
     *
     * TweetView
     *
     * View used to generate the Twitter style cards elements.
     *
     */
    var TweetView = Backbone.View.extend({
        template: JST['app/scripts/templates/tweetView.ejs'],
        className: 'tweet',
        initialize: function( /*opts*/ ) {
            _.bindAll(this, 'render');
        },
        /*
         * convert a ms timestamp into something more human friendly
         * in the style of twitter.
         */
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
        /*
         *
         * Take the associated Backbone.Model and massage the JSON
         * so that it outputs human friendly values.
         *
         */
        toJSON: function(model) {
            var json = model.toJSON();
            var createdAt = new Date(json.created_at);
            var createdMs = createdAt.getTime();
            var nowMs = Date.now();
            json.timesince = this.millisToNearestUnit(nowMs - createdMs);

            /* Twitter style date and time formating */
            var timeStr = createdAt.toLocaleTimeString().replace(/:\d{2} /, ' ');
            var dateArr = dateRegexp.exec(createdAt.toDateString());
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

    /*
     *
     * TweetAreaView
     *
     * Manages the DOM element responsible for animating and displaying
     * the TweetViews in a scrolling list.
     *
     */
    var TweetAreaView = Backbone.View.extend({
        el: '.tweet-area',
        itemView: TweetView,
        removeCount: 5,
        /*
         *
         * Read optional values and bind fns to this
         * instance.
         *
         */
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
        /*
         *
         * Animate the insert from left or right callback
         *
         * @param $tweets - group of tweets that have just been animated to scroll down
         * @param model to add to TweetAreaView
         *
         */
        animateInsertion: function($tweets, model) {
            var classList;
            if ($tweets.length) {
                var classLists = _.map($tweets, function($tweet) {
                    // read
                    return $tweet.classList;
                });
                _.each(classLists, function(classList) {
                    // write
                    classList.remove('slide-down1');
                    classList.remove('animate0');
                });
            }

            var view = new this.itemView({
                attributes: {
                    'data-id': model.id
                },
                model: model
            });
            this.viewModel[model.id] = view;
            view.render();
            var fn = function() {
                    var el = view.el;
                    classList = el.classList;
                    classList.remove('animate0');
                    classList.remove('reveal-left');
                    classList.remove('reveal-right');
                    el.removeEventListener('webkitAnimationEnd', fn);
                    el.removeEventListener('animationend', fn);
                    //console.log(view.el.className);
                };
            view.el.addEventListener('animationend', fn);
            view.el.addEventListener('webkitAnimationEnd', fn);
            classList = view.el.classList;
            classList.add(this.addClazz);
            classList.add('animate0');
            this.$el.prepend(view.$el);
            setTimeout(this.cleanUpOldTweetViews, 0);
        },
        /*
         *
         * Callback to manage the total number of
         * elements being displayed.
         *
         * Once an element has scrolled out of the view port it is
         * safe to remove it from the view.
         *
         */
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
            delete view.$el.prevObject;
            view.model = null;
            this.viewModel[id] = null;
            delete this.viewModel[id];
            //console.timeEnd('cleaning up views');
        },
        /*
         *
         * Collection callback to handle 'add' events.
         * Responsible for initiating the scroll animation
         * for all existing events and triggering the callback
         * to add a new TweetView.
         *
         * Uses jQuery deferred/promises to manage the callback chain.
         *
         */
        add: function(model) {
            var d = $.Deferred();
            var $tweets = this.$('.tweet');
            delete $tweets.prevObject;
            if ($tweets.length) {
                _.each($tweets, function(tweet) {
                    var classList = tweet.classList;
                    classList.add('slide-down1');
                    classList.add('animate0');
                });
                var firstTweet = $tweets[0];
                var fn = function(el) {
                        firstTweet.removeEventListener('webkitAnimationEnd', fn);
                        firstTweet.removeEventListener('animationend', fn);
                        d.resolve(el);
                    };
                firstTweet.addEventListener('webkitAnimationEnd', fn);
                firstTweet.addEventListener('animationend', fn);
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
