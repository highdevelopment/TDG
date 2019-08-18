'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var cookieParser = require('cookie-parser');
var fs = require('fs');

var app = module.exports = loopback();

var helpers =  {
  toJSON: function(object) {
    return JSON.stringify(object);
  },
  math: function(lvalue, operator, rvalue) {lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);
      return {
          "+": lvalue + rvalue,
          "-": lvalue - rvalue,
          "*": lvalue * rvalue,
          "/": lvalue / rvalue,
          "%": lvalue % rvalue
      }[operator];
  },
  eq: function( a, b ){
    return (a === b);
  },
  gt: function( a, b ){
    return (a > b);
  },
  gte: function( a, b ){
    return (a >= b);
  },
  lt: function( a, b ){
    return (a < b);
  },
  lte: function( a, b ){
    return (a <= b);
  },
  ne: function( a, b ){
    return (a !== b);
  },
  for: function(from, to, incr, block) {
    var accum = '';
    for(var i = from; i < to; i += incr)
        accum += block.fn(i);
    return accum;
  },
  toFixed: function(amount, fix) {
    return amount.toFixed(fix);
  }
}
var hbs = exphbs.create({
  // defaultLayout: 'main',
  helpers      : helpers,
  partialsDir: [
    __dirname + '/views/partials/'
  ],
  extname: 'handlebars'
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// hbs.getPartials().then(function (partials) {
//   console.log(partials);
// });
app.use(cookieParser('_32nkjk2nn43klnl3knl43lknflk4n3_'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(loopback.static(path.join(__dirname, 'public')));
app.use(loopback.token({  
  cookies: ['access_token'],
  headers: ['access_token', 'X-Access-Token'],
  params:  ['access_token'],
  model: app.models.accessToken
}));
app.middleware('auth', loopback.token());

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
