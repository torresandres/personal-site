import gulp from 'gulp';
import browsersync from 'browser-sync';
import mainBowerFiles from 'main-bower-files';
import ftp from 'vinyl-ftp';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins({camelize: true});

const sassLintOptions = {options: {configFile: './.sass-lint.yml'}};
const autoprefixerOptions = {browsers: ['last 2 versions'], cascade: false};
const cleanCssOptions = {compatibility: 'ie8', keepSpecialComments: 0};

const srcViews = './src/views/**/*.pug';
const srcStyles = './src/styles/**/*.sass';
const destStyles = './dist/assets/css';
const srcScripts = './src/scripts/**/*.js';
const destScripts = './dist/assets/js';
const srcImages = './src/images/**.*{png,jpg,jpeg,gif,svg}';
const destImages = './dist/assets/images';

gulp.task('views', () =>
  gulp.src([srcViews, '!./src/views/**/_*.pug'])
    .pipe($.plumber())
    .pipe($.data(require('./src/data/index.js')))
    .pipe($.pug({pretty: true}))
    .pipe(gulp.dest('./dist'))
    .pipe(browsersync.stream())
);

gulp.task('styles', () =>
  gulp.src([srcStyles])
    .pipe($.sourcemaps.init())
    .pipe($.plumber())
    .pipe($.sassLint(sassLintOptions))
    .pipe($.sassLint.format())
    .pipe($.sass({indentedSyntax: true}))
    .pipe($.autoprefixer(autoprefixerOptions))
    .pipe($.concat('styles.css'))
    .pipe($.cleanCss(cleanCssOptions))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(destStyles))
    .pipe(browsersync.stream())
);

gulp.task('styles:bower', () =>
  gulp.src(mainBowerFiles({filter: '**/*.css'}))
    .pipe($.concat('vendor.css'))
    .pipe($.cleanCss(cleanCssOptions))
    .pipe(gulp.dest(destStyles))
    .pipe(browsersync.stream())
);

gulp.task('scripts', () =>
  gulp.src([srcScripts])
    .pipe($.sourcemaps.init())
    .pipe($.plumber())
    .pipe($.babel({presets: ['es2015']}))
    .pipe($.uglify())
    .pipe($.concat('main.js'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(destScripts))
    .pipe(browsersync.stream())
);

gulp.task('scripts:bower', () =>
  gulp.src(mainBowerFiles({filter: '**/*.js'}))
    .pipe($.concat('vendor.js'))
    .pipe($.uglify())
    .pipe(gulp.dest(destScripts))
    .pipe(browsersync.stream())
);

gulp.task('images', () =>
  gulp.src(srcImages)
    .pipe($.destClean(destImages))
    .pipe($.newer(destImages))
    .pipe($.imageminQuiet())
    .pipe(gulp.dest(destImages))
);

gulp.task('watch', ['build'], () => {
  browsersync.init({server: {baseDir: './dist'}});
  gulp.watch([srcViews, './src/**/*.json'], ['views']);
  gulp.watch([srcImages], ['images', 'views']);
  gulp.watch([srcStyles], ['styles']);
  gulp.watch([srcScripts], ['scripts']);
  gulp.watch(['./dist/**/*.{html,js}']).on('change', browsersync.reload);
});

gulp.task('deploy', ['build'], () => {
  require('dotenv').config();
  const conn = ftp.create({
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASS,
    parallel: 10,
    log: $.util.log
  });

  return gulp.src('./dist/**/*', {buffer: false})
    .pipe(conn.newer('/'))
    .pipe(conn.dest('/'));
});

gulp.task('bower', ['styles:bower', 'scripts:bower']);

gulp.task('build', ['bower', 'styles', 'scripts', 'images', 'views']);

gulp.task('serve', ['build', 'watch']);

gulp.task('default', ['build']);
