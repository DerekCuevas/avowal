# Validation

Super lightweight zero dependency asynchronous JavaScript form validation.
Work in Progress.

## Setup
Clone or 'npm install' this repository.

```sh
git clone https://github.com/DerekCuevas/Validation.git
or
npm install git+https://github.com/DerekCuevas/Validation.git
```

Require with commonJS (Node / browserify)

```javascript
var Validation = require('Validation');
```
or include directly via a script tag

```html
<script src="Validation.js"></script>
```

#### Creating a form validation instance

```javascript
var signup = new Validation({

    // the name of the form as specified by <form name='' ... ></form>
    name: 'signup',

    // the validation event
    on: 'input',

    // location of handlebars like HTML templates to be rendered against each input
    templates: {
        success: 'template.success',
        error: 'template.error'
    }
});
```

#### Adding a delegate
Each input can specify a life cycle object, the bare minimum life cycle object will include the validate method only.

```javascript
    signup.delegate({
        email: {

            // The only required lifecycle method, validate accepts two parameters,
            // the current value of the input and a callback function.
            // The callback accepts two required values, a boolean (valid / invalid) and 
            // a message to be rendered in one of your templates under the input.
            // Must return the state of the value with the callback as show below.
            validate: function (val, cb) {
                cb(true, 'Your email address looks valid.');
            },
        }
    });
```

All possible lifecycle events (with thier arguments) are listed below.

```javascript
    signup.delegate({
        username: {

            // Called just before any events are bound to the input,
            // the input DOM ref is passed in as an argument.
            init: function (input) {...},

            // The main validation function (documented above).
            validate: function (val, cb) {...},

            // called when the input's state changes to valid
            whenValid: function (val) {...},

            // called when the input's state changes to invalid
            whenInvalid: function (val) {...},

            // transforms the value to the returned value as the user types
            // fires on 'input' event
            transform: function (val) {...}
        }
    });
```
