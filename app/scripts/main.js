/*global require, $ */
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone-amd/backbone',
        underscore: '../bower_components/underscore-amd/underscore',
        bootstrap: 'vendor/bootstrap'
    }
});

require(['underscore', 'backbone', 'routes/application-router', 'views/application-view', 'collections/application-collection'], function(_, Backbone, Router, Views, Collections) {
    var appRouter = new Router();
    var redTweets = new Collections([], {
        hashTag: 'coke'
    });
    var blueTweets = new Collections([], {
        hashTag: 'pepsi'
    });
    var redTweetArea = new Views.TweetAreaView({
        collection: redTweets,
        addClazz: 'reveal-right'
    });
    var blueTweetArea = new Views.TweetAreaView({
        collection: blueTweets,
        addClazz: 'reveal-left'
    });

    /*
     *
     * Expose Application to window for debugging and testing
     *
     */
    var app = {
        lib: {
            Views: {
                TweetView: Views.TweetView
            }
        },
        views: {
            red: redTweetArea,
            blue: blueTweetArea
        },
        router: appRouter,
        tweets: {
            red: redTweets,
            blue: blueTweets
        },
        interval: {}
    };
    window.app = app;

    /*
     * Bind Tweet Areas to existing DOM Elements
     */
    redTweetArea.setElement('.red.tweet-area');
    blueTweetArea.setElement('.blue.tweet-area');

    /*
     * Fetch first tweets
     */
    setTimeout(function() {
        app.tweets.red.fetch();
        app.tweets.blue.fetch();
    }, 0);

    var sleep = 8000;
    /*
     * Start fetching tweets every 8 seconds
     */
    app.interval.red = setInterval(function() {
        app.tweets.red.fetch();
    }, sleep);
    app.interval.blue = setInterval(function() {
        app.tweets.blue.fetch();
    }, sleep);

    /*
     *
     * This belongs in a navbar view but it's not
     * very complex. Leaving it here for now.
     * Basically a toggle for starting and stopping
     * the fetching of tweets.
     *
     */
    var labels = {
        coke: {
            stop: 'Stop coke',
            start: 'Start coke'
        },
        pepsi: {
            stop: 'Stop pepsi',
            start: 'Start pepsi'
        }
    };
    var makeToggleFn = function(opts) {
            return function() {
                if (opts.$btn.text() === opts.stop) {
                    clearInterval(opts.interval);
                    opts.$btn.text(opts.start);
                } else {
                    opts.collection.fetch();
                    opts.interval = setInterval(function() {
                        opts.collection.fetch();
                    }, opts.sleep);
                    opts.$btn.text(opts.stop);
                }
            };
        };
    var $cokebtn = $('.navbar .btn-coke');
    $cokebtn.on('click', _.debounce(
    makeToggleFn({
        interval: app.interval.red,
        $btn: $cokebtn,
        collection: app.tweets.red,
        start: labels.coke.start,
        stop: labels.coke.stop,
        sleep: sleep
    }), 250, true));

    var $pepsibtn = $('.navbar .btn-pepsi');
    $pepsibtn.on('click', _.debounce(
    makeToggleFn({
        interval: app.interval.blue,
        $btn: $pepsibtn,
        collection: app.tweets.blue,
        start: labels.pepsi.start,
        stop: labels.pepsi.stop,
        sleep: sleep
    }), 250, true));
});
