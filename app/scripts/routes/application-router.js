/*global define */

define(['jquery', 'backbone', ], function($, Backbone) {
    'use strict';

    var ApplicationRouter = Backbone.Router.extend({
        routes: {
            '*actions': 'defaultRoute'
        },
    });

    return ApplicationRouter;
});
