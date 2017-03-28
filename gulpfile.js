'use strict';

const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const cssmin = require('gulp-cssmin');
const gulp = require('gulp');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');

const path = './docs/';
const sassPath = './src/sass/';
const libPath = './src/libs/';

gulp.task('browserSync', () => {
	browserSync({
		server: {
			baseDir: path
		}
	});

	gulp.watch(sassPath + '**/*.scss', ['sass']);
	gulp.watch(path + '**', () => {
		browserSync.reload();
	});
});

gulp.task('concatCSS', () => {
	return gulp.src([libPath + 'css/base.css', libPath + 'css/colors.css', libPath + 'css/prism.css'])
		.pipe(concat('lib.css'))
		//.pipe(cssmin())
		.pipe(gulp.dest(path + 'css'));
});

gulp.task('concatJS', () => {
	return gulp.src([libPath + 'js/webslides.js', libPath + 'js/prism.js'])
		.pipe(concat('lib.js'))
		//.pipe(uglify())
		.pipe(gulp.dest(path + 'js'));
});

gulp.task('sass', () => {
	return gulp.src(sassPath + '**/*.scss')
		.pipe(plumber({
			errorHandler: notify.onError({
				title: 'Sass Compile Error',
				message: 'Error: <%= error.message %>'
			})
		}))
		.pipe(sass({ outputStyle: 'expanded' }))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
		}))
		.pipe(gulp.dest(path + 'css'));
});

gulp.task('default', ['browserSync', 'sass']);
