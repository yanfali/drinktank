/*global define*/

define(['underscore', 'backbone', 'models/application-model'], function(_, Backbone, Tweet) {
    'use strict';

    var Tweets = Backbone.Collection.extend({
        model: Tweet,
        hashTag: 'pepsi',
        count: 1,
        lang: 'en',
        initialize: function(models, opts) {
            if (opts) {
                if (opts.hashTag) {
                    this.hashTag = opts.hashTag;
                }
            }
            _.bindAll(this, 'parse');
        },
        baseUrl: 'http://search.twitter.com/search.json',
        url: function() {
            if (this.nextPage) {
                return this.baseUrl + this.nextPage + '&callback=?';
            }
            return this.baseUrl + '?q=%23' + this.hashTag + '&rpp=' + this.count + '&lang=' + this.lang + '&callback=?';
        },
        parse: function(data) {
            //console.log(data);
            this.nextPage = data.next_page;
            this.page = data.page;
            return data.results;
        }
    });

    return Tweets;
});
