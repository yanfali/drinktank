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

require(['backbone', 'routes/application-router', 'views/application-view', 'collections/application-collection'], function(Backbone, Router, Views, Collections) {
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

    /*
     * Start fetching tweets every 10 seconds
     */
    app.interval.red = setInterval(function() {
        app.tweets.red.fetch();
    }, 10000);
    app.interval.blue = setInterval(function() {
        app.tweets.blue.fetch();
    }, 10000);

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
    var $cokebtn = $('.navbar .btn-coke');
    $cokebtn.on('click', function() {
        if ($cokebtn.text() === labels.coke.stop) {
            clearInterval(app.interval.red);
            $cokebtn.text(labels.coke.start);
        } else {
            app.tweets.red.fetch();
            app.interval.red = setInterval(function() {
                app.tweets.red.fetch();
            }, 10000);
            $cokebtn.text(labels.coke.stop);
        }
    });

    var $pepsibtn = $('.navbar .btn-pepsi');
    $pepsibtn.on('click', function() {
        if ($pepsibtn.text() === labels.pepsi.stop) {
            clearInterval(app.interval.blue);
            $pepsibtn.text(labels.pepsi.start);
        } else {
            app.tweets.blue.fetch();
            app.interval.blue = setInterval(function() {
                app.tweets.blue.fetch();
            }, 10000);
            $pepsibtn.text(labels.pepsi.stop);
        }
    });
});
