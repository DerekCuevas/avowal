# Avowal
Super lightweight zero dependency optionally asynchronous JavaScript form validation framework (phew!).

A lot of JavaScript form validation frameworks aim to validate any and every possible set of input data. For example, all types of numeric input (ranges, phone numbers), string input (email addresses), ect.

This framework does not take that approach, rather it aims at separating common form based events (input, blur, change, submit, ...) from functions that validate input data along with functions to process side effects on that data.

An arbitrary number of form inputs can be validated that require asynchronous validation (ex. AJAX) while avoiding race conditions and callback hell.

The API is 100% js based, DOM attributes are not used to validate data. There is support for rendering validation messages against form inputs with templates (see examples).

More documentation can be found in the doc/ directory. Work in Progress (see Todo).

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

// create a new instance
var particle = new Validation({
    name: 'particle',
    on: 'input',
    templates: {
        success: '<p class="success">{{status}}</p>',
        error: '<p class="error">{{status}}</p>'
    }
});

// attach a delegate
particle.delegate({

    // specify a lifecycle object for each input in the form
    color: {

        // on: OPTIONAL
        // Specify a form input event to validate on. (input, blur, change, ...)
        // For consistency use the constructors options.on value instead.
        on: ''

        // init: OPTIONAL
        // Init is called once when the form is mounted, and after every reset
        // of the form. The input DOM ref is passed in as an arg.
        init: function (input) {
        },

        // validate: REQUIRED
        // Validate accepts two params, the current value of the input and a
        // callback function. Pass the result of the validation back through the
        // callback. The callback has the following signature - callback(valid, message)
        validate: function (color, callback) {
        },

        // whenValid: OPTIONAL
        // WhenValid gets called whenever the validate function above returns true.
        // The value of the input is passed in as an arg.
        whenValid: function (color) {
        },

        // whenInvalid: OPTIONAL
        // WhenInvalid gets called whenever the validate function above returns false.
        // The value of the input is passed in as an arg.
        whenInvalid: function (color) {
        },

        // transform: OPTIONAL
        // Called on input, this function can be used to modify the input
        // real time as the user types. The old value of the input is passed in as an arg.
        // the new value should be returned.
        transform: function (oldColor) {
            return newColor;
        }
    },
    ...
});

particle.on('submit', function (e) {
    e.preventDefault();

    particle.validateAll(function (valid) {
        if (valid) {
            draw(particle.values());
        }
    });
});
```

## Examples
Examples of the form validation can be found in /examples. There are two examples, a particle editor (/particle) and a sign up form (/signup).

## To do
- replace jslint with eslint, add .eslintrc
- documentation work
- consider rewriting in es6 w/babel
- make rendering templates optional
- better status-message support / cache status-message ref (re-work this)
- add getState / setState methods

## Ideas
- allow multiple placeholder values on templates

```javascript
template: '<div>{{msg}}{{status}}{{other}}</div>'
callback({
    valid: true/false,
    render: {
        msg: '',
        status: '',
        other: '',
        ...
    }
});
```
