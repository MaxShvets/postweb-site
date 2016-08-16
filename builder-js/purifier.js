var purify = require('/Users/MaxShvets/.npm-packages/lib/node_modules/purify-css/src/purifycss.js');

var content = ['../projects/mini-chef/index.html'];
var css = ['../styles/bootstrap.min.css'];

purify(content, css, {
    output: '../styles/purestrap.min.css',
    rejected: true,
    minify: true
});
