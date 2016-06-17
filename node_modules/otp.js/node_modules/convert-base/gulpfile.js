var gulp = require('gulp'),
    pkg = require('./package.json'),
    plugins = require('gulp-load-plugins')(),
    banner = [
        '/*!',
        ' * <%= config.name %> - <%= config.description %>',
        ' * @version v<%= config.version %> - <%= config.today %>',
        ' * @link <%= config.homepage %>',
        ' * @author <%= config.author %>',
        ' * @license <%= config.license %>',
        ' */',
        ''
    ].join('\n'),
    config = pkg;

config.src = "src/";
config.dest = "dist/";
config.today = (new Date()).toDateString();

gulp.task('default', function() {
    return gulp.src(config.src + config.name + '.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.header(banner, {
            config: config
        }))
        .pipe(gulp.dest(config.dest))
        .pipe(plugins.uglify())
        .pipe(plugins.concat(config.name + '.min.js'))
        .pipe(plugins.header(banner, {
            config: config
        }))
        .pipe(gulp.dest(config.dest));
});
