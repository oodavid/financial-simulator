'use strict';
/** MAIN - BUNDLE
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
 *      @author   David 'oodavid' King
 */
require('./app.js');
require('./filters.js');
require('./financeService.js');
require('./LoanFactory.js');
require('./demo.js');