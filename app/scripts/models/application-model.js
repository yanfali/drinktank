/*global define*/

define(['underscore', 'backbone', ], function(_, Backbone) {
    'use strict';

    /*
     * Backbone Tweet Model
     *
     * Does nothing particularly interesting, just holds attributes
     * returned by twitter
     */
    var Tweet = Backbone.Model.extend({
        defaults: {}
    });

    return Tweet;
});
