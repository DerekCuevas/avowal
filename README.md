# Validation
Super lightweight zero dependency optionally asynchronous JavaScript form validation. 

An arbitrary number of form inputs can be validated that require asynchronous validation (ex. AJAX) while avoiding race conditions and other common pitfalls. Detailed documentation is in the doc/ directory.

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

## Examples
Exapmles of the form validation can be found in /examples. There are two examples, a particle editior (particle) and a sign up form (signup).

## Todo
- documentation work
- better status-message support / cache ref (re-work this)
- better template support
- add getState / setState methods
