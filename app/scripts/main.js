/*global require */
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
    var redTweetArea = new Views.TweetAreaView();
    var blueTweetArea = new Views.TweetAreaView();
    var tweets = new Collections();
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
        tweets: tweets
    };
    window.app = app;
    redTweetArea.setElement('.red.tweet-area');
    blueTweetArea.setElement('.blue.tweet-area');
    appRouter.on('route:defaultRoute', function(actions) {
        if (actions === null) {
            console.log(new Date() + ' initial load');
        } else {
            console.log(new Date() + ' route ' + actions);
        }
    });
    Backbone.history.start();
});
