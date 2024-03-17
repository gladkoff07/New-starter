import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import sourcemaps from "gulp-sourcemaps";
import autoPrefixer from "gulp-autoprefixer";
import pug from "gulp-pug";
import beauty from "gulp-html-beautify";
import plumber from "gulp-plumber";
import notify from "gulp-notify";
import browserSync from "browser-sync";
import rename from "gulp-rename";
import cleanCss from "gulp-clean-css";
import babel from "gulp-babel";
import { deleteAsync } from "del";
import webpack from "webpack";
import webpackStream from "webpack-stream";
import svgSprite from "gulp-svg-sprites";
import util from "gulp-util";
import ftp from "vinyl-ftp";
import imageMin from "gulp-imagemin";
import extReplace from "gulp-ext-replace";
import webp from "imagemin-webp";
const sass = gulpSass(dartSass);


import sassLint from 'gulp-sass-lint';
import jshint from 'gulp-jshint';
import stylish from 'jshint-stylish';

/* Config */
const coreDir = {
  src: "src",
  dist: "build",
};

const config = {
  styles: {
    src: `${coreDir.src}/scss/*.scss`,
    dist: `${coreDir.dist}/css`,
    watch: `${coreDir.src}/scss/**/*.scss`,
  },
  img: {
    src: `${coreDir.src}/img/*`,
    dist: `${coreDir.dist}/img`,
    watch: `${coreDir.src}/img/**/*`,
  },
  svg: {
    src: `${coreDir.src}/svg/*`,
    dist: `${coreDir.dist}/svg`,
    watch: `${coreDir.src}/svg/**/*`,
  },
  fonts: {
    src: `${coreDir.src}/fonts/*`,
    dist: `${coreDir.dist}/fonts`,
    watch: `${coreDir.src}/fonts/**/*`,
  },
  scripts: {
    src: [`${coreDir.src}/js/*.js`, `!${coreDir.src}/js/vendor.js`],
    dist: `${coreDir.dist}/js`,
    watch: [`${coreDir.src}/js/**/*.js`, `!${coreDir.src}/js/vendor.js`],
  },
  scriptLibs: {
    src: `${coreDir.src}/js/vendor.js`,
    dist: `${coreDir.dist}/js`,
    watch: `${coreDir.src}/js/vendor.js`,
  },
  pug: {
    src: `${coreDir.src}/pug/*.pug`,
    dist: `${coreDir.dist}/`,
    watch: `${coreDir.src}/pug/**/*.pug`,
  },
  html: {
    src: `${coreDir.dist}/*.html`,
    dist: `${coreDir.dist}/`,
    watch: `${coreDir.dist}/*.html`,
  },
};

/* Styles */
gulp.task("styles:dev", () => {
  return gulp
    .src(config.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", notify.onError()))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.styles.dist))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("styles:build", () => {
  return gulp
    .src(config.styles.src)
    .pipe(sass().on("error", notify.onError()))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(autoPrefixer())
    .pipe(cleanCss({ level: { 1: { specialComments: 1 } } }))
    .pipe(gulp.dest(config.styles.dist));
});

/* Img */
gulp.task("img", () => {
  return gulp.src(config.img.src).pipe(gulp.dest(config.img.dist));
});

/* Fonts */
gulp.task("fonts", () => {
  return gulp.src(config.fonts.src).pipe(gulp.dest(config.fonts.dist));
});

/* Svg */
gulp.task("svg", () => {
  return gulp.src(config.svg.src).pipe(gulp.dest(config.svg.dist));
});

/* Scripts */
import webpackConfig from "./webpack.config.js";

gulp.task("scripts:dev", () => {
  return gulp
    .src(config.scripts.src)
    .pipe(babel())
    .pipe(gulp.dest(config.scripts.dist))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("scripts:build", () => {
  return gulp
    .src(config.scripts.src)
    .pipe(babel())
    .pipe(gulp.dest(config.scripts.dist));
});

gulp.task("script-libs", () => {
  return gulp
    .src(config.scriptLibs.src)
    .pipe(webpackStream(webpackConfig), webpack)
    .pipe(gulp.dest(config.scriptLibs.dist));
});

// Remove html before build
gulp.task("html-del", () => {
  return deleteAsync([config.html.src]);
});

/* PUG */
gulp.task("pug:dev", () => {
  return gulp
    .src(config.pug.src)
    .pipe(plumber())
    .pipe(pug().on("error", notify.onError()))
    .pipe(plumber.stop())
    .pipe(gulp.dest(config.pug.dist))
    .pipe(browserSync.stream());
    // .pipe(browserSync.reload({ stream: true }));
});

// Remove html before build
gulp.task(
  "pug:build",
  gulp.series("html-del", () => {
    return gulp
      .src(config.pug.src)
      .pipe(plumber())
      .pipe(pug({ pretty: true }).on("error", notify.onError()))
      .pipe(plumber.stop())
      .pipe(gulp.dest(config.pug.dist));
  })
);

/* HTML */
const beautyOpts = {
  indent_size: 2,
  indent_with_tabs: true,
  end_with_newline: true,
  keep_array_indentation: true,
  unformatted: [
    "abbr",
    "area",
    "b",
    "bdi",
    "bdo",
    "br",
    "cite",
    "code",
    "data",
    "datalist",
    "del",
    "dfn",
    "em",
    "embed",
    "i",
    "ins",
    "kbd",
    "keygen",
    "map",
    "mark",
    "math",
    "meter",
    "noscript",
    "object",
    "output",
    "progress",
    "q",
    "ruby",
    "s",
    "samp",
    "small",
    "strong",
    "sub",
    "sup",
    "template",
    "time",
    "u",
    "var",
    "wbr",
    "text",
    "acronym",
    "address",
    "big",
    "dt",
    "ins",
    "strike",
    "tt",
  ],
};

gulp.task("html-beauty", function () {
  return gulp
    .src(config.html.src)
    .pipe(beauty(beautyOpts))
    .pipe(gulp.dest(config.html.dist));
});

/* Browser Sync */
gulp.task("browser-sync", () => {
  browserSync({
    server: {
      baseDir: coreDir.dist,
    },
  });
});

/* SVG Sprite */
gulp.task("svg:sprite", function () {
  return gulp
    .src("src/sources/svg/*.svg")
    .pipe(
      svgSprite({
        mode: "symbols",
      })
    )
    .pipe(gulp.dest("src"));
});

/* Convert png to webp */
gulp.task("img:webp", function () {
  const stream = gulp
    .src("./src/sources/img/**/*.{jpg,png}")
    .pipe(
      imageMin({
        verbose: true,
        plugins: webp({ quality: 70 }),
      })
    )
    .pipe(extReplace(".webp"))
    .pipe(gulp.dest("./src/img"));
  return stream;
});

// SASS LINT
gulp.task("scss:lint", function () {
  return gulp
    .src(config.styles.src)
    .pipe(sassLint({
      options: {
        formatter: 'stylish',
        'merge-default-rules': true
      },
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});

// JS LINTER
gulp.task("js:lint", function () {
  return gulp
    .src(config.scripts.src)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

// add settings Host(create file apiHost.js for your data)
// import dataHost from "./apiHost.js";

/* Deploy */
gulp.task("deploy", function () {
  var conn = ftp.create({
    host: dataHost.host,
    user: dataHost.user,
    password: dataHost.password,
    parallel: 10,
    log: util.log,
  });

  var globs = ["build/**"];

  // using base = '.' will transfer everything to /public_html correctly
  // turn off buffering in gulp.src for best performance
  return gulp
    .src(globs, { base: "build", buffer: false })
    .pipe(conn.newer("www/html/nameDomain/sites/nameSite/")) // only upload newer files
    .pipe(conn.dest("www/html/nameDomain/sites/nameSite/"));
});

/* Dev */
gulp.task(
  "watch",
  gulp.parallel(
    "browser-sync",
    "pug:dev",
    "styles:dev",
    "img",
    "fonts",
    "svg",
    "scripts:dev",
    "script-libs",
    () => {
      gulp.watch(config.styles.watch, gulp.series("styles:dev"));
      gulp.watch(config.img.watch, gulp.series("img"));
      gulp.watch(config.fonts.watch, gulp.series("fonts"));
      gulp.watch(config.svg.watch, gulp.series("svg"));
      gulp.watch(config.pug.watch, gulp.series("pug:dev"));
      gulp.watch(config.scripts.watch, gulp.series("scripts:dev"));
      gulp.watch(config.scriptLibs.watch, gulp.series("script-libs"));
      gulp.watch(config.html.src, browserSync.reload);
    }
  )
);

/* Build */
gulp.task(
  "build",
  gulp.parallel(
    "styles:build",
    "pug:build",
    "fonts",
    "svg",
    "scripts:build",
    "script-libs",
    () => {
      gulp.series("html-beauty");
    }
  )
);

/* Default Watch */
gulp.task("default", gulp.parallel("watch"));