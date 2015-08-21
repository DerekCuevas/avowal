/**
 * a micro rest api / server for the signup form
 */
'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var users = [
    {username: '@jdoe', user: 'John Doe'},
    {username: '@janed', user: 'Jane Doe'}
];

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/users', function (req, res) {
    res.json(users);
});

app.get('/available', function (req, res) {
    var username = req.query.username;

    var count = users.filter(function (user) {
        return user.username === username;
    }).length;

    // setting a more realistic delay, don't do this in production
    setTimeout(function () {
        res.json(count === 0);
    }, 500);
});

app.post('/signup', function (req, res) {
    users.push({
        username: req.body.username,
        user: req.body.first + ' ' + req.body.last
    });
    res.redirect(303, '/users');
});

app.listen(app.get('port'), function () {
    console.log('app in %s at http://localhost:%s',
        app.get('env'), app.get('port'));
});
