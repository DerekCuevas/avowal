var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var users = [
    {username: '@batman', user: 'Bruce Wayne'},
    {username: '@superman', user: 'Clark Kent'},
    {username: '@jdoe', user: 'John Doe'},
];

app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/users', function (req, res) {
    res.json(users);
});

app.post('/users', function (req, res) {
    users.push({
        username: req.body.username,
        user: req.body.first + ' ' + req.body.last,
    });
    res.redirect(303, '/users');
});

app.get('/users/available', function (req, res) {
    var username = req.query.username;

    var count = users.filter(function (user) {
        return user.username === username;
    }).length;

    // setting a more realistic delay for example purposes
    setTimeout(function () {
        res.json(count === 0);
    }, 150);
});

app.listen(app.get('port'), function () {
    console.log('app in %s at http://localhost:%s', app.get('env'), app.get('port'));
});
