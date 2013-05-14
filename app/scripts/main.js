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
    var tweetArea = new Views.TweetAreaView();
    var tweets = new Collections();
    var app = {
        views: {
            tweetArea: tweetArea
        },
        router: appRouter,
        tweets: tweets
    };
    window.app = app;
    tweetArea.setElement('.tweet-area');
    appRouter.on('route:defaultRoute', function(actions) {
        if (actions === null) {
            console.log(new Date() + ' initial load');
        } else {
            console.log(new Date() + ' route ' + actions);
        }
    });
    Backbone.history.start();
});
