'use strict';
/** LIBRARIES - BUNDLE
 *
 *      Use this file to require() all your javascript files
 *       in the npm-style. They will automatically be bundled
 *       together as a single minified script.
 *
 *      This gets bundled into a .js (plus sourcemap) by npm
 *      Some simple things to note:
 *          require('not-relative');   --  this references an NPM package, to add new packages do  `npm install package-name --save`
 *          require('./relative.js');  --  this references a a local file
 *
 *      Please use stable CDN's where possible - see index.html
 *
 *      @author   David "oodavid" King
 */
require('jquery');
require('lodash');
require('angular');
require('angular-animate');
require('angular-google-chart');