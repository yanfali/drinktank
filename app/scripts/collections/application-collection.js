/*global define*/

define(['underscore', 'backbone', 'models/application-model'], function(_, Backbone, Tweet) {
    'use strict';

    /*
     *
     * Backbone Tweet Collection
     *
     */
    var Tweets = Backbone.Collection.extend({
        model: Tweet,
        hashTag: 'pepsi',
        count: 1,
        cycle: 20,
        lang: 'en',
        /*
         * Backbone.js hook: Setup optional parameters and fn bindings
         */
        initialize: function(models, opts) {
            if (opts) {
                if (opts.hashTag) {
                    this.hashTag = opts.hashTag;
                }
            }
            _.bindAll(this, 'parse');
        },
        baseUrl: 'http://search.twitter.com/search.json',
        /*
         * Backbone.js hook: Use a function to generate request URL
         */
        url: function() {
            if (this.page < this.cycle && this.nextPage) {
                return this.baseUrl + this.nextPage + '&callback=?';
            }
            return this.baseUrl + '?q=%23' + this.hashTag + '&rpp=' + this.count + '&lang=' + this.lang + '&callback=?';
        },
        /*
         * Backbone.js hook: Use a custom parse function to use jsonp output
         */
        parse: function(data) {
            //console.log(data);
            this.nextPage = data.next_page;
            this.refreshUrl = data.refresh_url;
            this.page = data.page;
            return data.results;
        }
    });

    return Tweets;
});
