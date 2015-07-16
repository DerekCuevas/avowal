var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));

var users = [
    {username: '@jdoe', user: 'John Doe'},
    {username: '@janed', user: 'Jane Doe'}
];

app.get('/users', function (req, res) {
    res.json(users);
});

app.get('/available', function (req, res) {
    var username = req.query.username;

    var count = users.filter(function (user) {
        return user.username === username;
    }).length;

    res.json(count === 0);
});

app.post('/signup', function (req, res) {
    users.push({
        username: req.body.username,
        user: req.body.name
    });
    res.redirect(303, '/users');
});

app.listen(app.get('port'), function () {
    console.log('app in %s at http://localhost:%s', 
        app.get('env'), app.get('port'));
});
