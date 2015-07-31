# Validation

Super lightweight zero dependency asynchronous JavaScript form validation.
Work in Progress.

## Setup
Clone or 'npm install' this repository.

Require with commonJS (Node) or include directly via a script tag

```javascript
var Validation = require('Validation');
```
or

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
