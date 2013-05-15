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
        dateRegexp = new RegExp(/(\w+)\s+(\w+)\s+(\d+)\s+(\d{4})/);
    var TweetView = Backbone.View.extend({
        template: JST['app/scripts/templates/tweet.ejs'],
        initialize: function( /*opts*/ ) {
            _.bindAll(this, 'render');
        },
        millisToNearestUnit: function(ms) {
            var secs, minutes, hours, days;
            console.log(ms + 'ms');
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
        render: function() {
            var json = this.model.toJSON();
            var date = new Date(json.created_at);
            var created = date.getTime();
            var now = Date.now();
            json.timesince = this.millisToNearestUnit(now - created);
            var timeStr = date.toLocaleTimeString().replace(/:\d{2} /, ' ');
            var dateArr = dateRegexp.exec(date.toDateString());
            json.created_at = timeStr + ' - ' + dateArr[3] + ' ' + dateArr[2] + ' ' + dateArr[4].substr(2, 4);
            this.$el.html(this.template(json));
        }
    });
    var TweetAreaView = Backbone.View.extend({
        el: '.tweet-area'
    });

    return {
        TweetView: TweetView,
        TweetAreaView: TweetAreaView
    };
});
