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
    redTweetArea.setElement('.red.tweet-area');
    blueTweetArea.setElement('.blue.tweet-area');
    app.tweets.red.fetch();
    app.tweets.blue.fetch();
    app.interval.red = setInterval(function() {
        app.tweets.red.fetch();
    }, 10000);
    app.interval.blue = setInterval(function() {
        app.tweets.blue.fetch();
    }, 10000);
    var $cokebtn = $('.navbar .btn-coke');
    $cokebtn.on('click', function() {
        if ($cokebtn.text() === 'Stop coke') {
            clearInterval(app.interval.red);
            $cokebtn.text('Start coke');
        } else {
            app.tweets.red.fetch();
            app.interval.red = setInterval(function() {
                app.tweets.red.fetch();
            }, 10000);
            $cokebtn.text('Stop coke');
        }
    });
    var $pepsibtn = $('.navbar .btn-pepsi');
    $pepsibtn.on('click', function() {
        if ($pepsibtn.text() === 'Stop pepsi') {
            clearInterval(app.interval.blue);
            $pepsibtn.text('Start pepsi');
        } else {
            app.tweets.blue.fetch();
            app.interval.blue = setInterval(function() {
                app.tweets.blue.fetch();
            }, 10000);
            $pepsibtn.text('Stop pepsi');
        }
    });
});
