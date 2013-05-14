/*global define*/

define(['jquery', 'underscore', 'backbone', 'templates', ], function($, _, Backbone, JST) {
    'use strict';

    var TweetView = Backbone.View.extend({
        template: JST['app/scripts/templates/tweet.ejs']
    });
    var TweetAreaView = Backbone.View.extend({
        el: '.tweet-area'
    });

    return {
        TweetView: TweetView,
        TweetAreaView: TweetAreaView
    };
});
