/*global define*/

define([
    'underscore',
    'backbone',
], function (_, Backbone) {
    'use strict';

    var Tweet = Backbone.Model.extend({
        defaults: {
        }
    });

    return Tweet;
});
