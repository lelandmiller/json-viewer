/*global describe, it */
'use strict';
var assert = require('assert');
var debug = require('../');

describe('metalsmith-visualdebug wintersmith plugin', function() {

    it('should return the original Metalsmith object for chaining', function() {
        var metalsmith = {};
        assert.strictEqual(debug(metalsmith), metalsmith, 'returned a different object than the original Metalsmith object');
    });

    it('should decorate the metalsmith object with a new use function', function() {
        var old_use = function() {};
        var metalsmith = {
            use: old_use
        };
        debug(metalsmith);
        assert.notStrictEqual(metalsmith.use, old_use, 'returned original use function');
    });

    it('should decorate the metalsmith object with a new build function', function() {
        var old_build = function() {};
        var metalsmith = {
            build: old_build
        };
        debug(metalsmith);
        assert.notStrictEqual(metalsmith.build, old_build, 'returned original build function');
    });

    it('the new use function should call the old use function', function() {
        var passing = false;
        var old_use = function() {
            passing = true;
        };
        var metalsmith = {
            use: old_use
        };
        debug(metalsmith).use();
        assert(passing, 'did not call original use function');
    });

    it('the new build function should call the old build function', function() {
        var passing = false;
        var old_build = function() {
            passing = true;
        };
        var metalsmith = {
            build: old_build
        };
        debug(metalsmith).build();
        assert(passing, 'did not call original build function');
    });

});
