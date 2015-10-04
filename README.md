# Validation
Super lightweight zero dependency optionally asynchronous JavaScript form validation framework (phew!).

Most js form validation frameworks aim to provide every possible way to validate input data. For example out of the box those frameworks provide ways to validate phone numbers, zip codes, email addresses ect. This framework does not take that approach, rather this framework aims at separating common form based events (input, blur, change, submit, ...) from functions that validate that input data along with functions to processes side effects on that data.

An arbitrary number of form inputs can be validated that require asynchronous validation (ex. AJAX) while avoiding race conditions and callback hell. More documentation is in the doc/ directory.

Work in Progress (see Todo).

## Setup
Clone or 'npm install' this repository.

```sh
git clone https://github.com/DerekCuevas/Validation.git
```

```sh
npm install git+https://github.com/DerekCuevas/Validation.git
```

Require with commonJS (Node / browserify) or include directly via a script tag.

```javascript
var Validation = require('Validation');
```

```html
<script src="Validation.js"></script>
```

## Basic use

```javascript
var person = new Validation({
    name: 'person',
    on: 'blur',
    templates: {
        success: '<p class="success">{{status}}</p>',
        error: '<p class="error">{{status}}</p>'
    }
});

person.delegate({
    name: {
        validate: function (name, callback) {
            // Validate the 'name' value, can be async validation if needed.
            // Call the callback when done.
            callback(true, 'The name entered is valid.');
        }
    },
    age: {
        validate: function (age, callback) {...}
    }
});

person.on('submit', function (e) {
    e.preventDefault();
    person.validateAll(function (valid) {
        if (valid) {
            // do something
        }
    }) 
});
```

## Examples
Examples of the form validation can be found in /examples. There are two examples, a particle editor (/particle) and a sign up form (/signup).

## Todo
- documentation work
- better status-message support / cache ref (re-work this)
- add getState / setState methods
