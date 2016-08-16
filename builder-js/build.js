var less = require('less');
var _ = require('underscore');

less.render('.class { width: (1 + 1) }', function (e, output) {
    console.log(output.css);
});

var rawTemplate = "<div class='entry'>\n" +
    '<h1><%= title %></h1>\n' +
"<div class='body'>\n" +
    '<%= body %>\n' +
'</div>\n' +
'</div>';

var entry = _.template(rawTemplate);
console.log(entry({body: 'Man', title: 'Gang'}));

var compiled = _.template("hello: <%= fileName %>");
console.log(compiled({fileName: 'moe'}));