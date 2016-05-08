var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');

gulp.task('deploy-examples', function() {
  return gulp.src(['./examples/**/*', '!./examples/signup/**/*']).pipe(ghPages());
});
