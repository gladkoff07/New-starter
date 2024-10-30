import gulp from "gulp";
import { src, dest, watch, parallel, series, lastRun } from 'gulp';
import * as dartSass from 'sass';
import gulpSass from "gulp-sass";
import rename from 'gulp-rename';
import cleanCss from "gulp-clean-css";
import autoPrefixer from "gulp-autoprefixer";
import { deleteAsync as del } from "del";
import notify from "gulp-notify";
import babel from "gulp-babel";
import plumber from "gulp-plumber";
import pug from "gulp-pug";
import svgSprite from "gulp-svg-sprites";
import imageMin from "gulp-imagemin";
import extReplace from "gulp-ext-replace";
import webp from "imagemin-webp";
import bs from "browser-sync";
import webpack from "webpack";
import webpackStream from "webpack-stream";

/* Scripts libraries */
import webpackConfig from "./webpack.config.js";

// add settings Host(create file apiHost.js for your data)
import dataHost from "./apiHost.js";

const sass = gulpSass(dartSass);
const browserSync = bs.create();

const coreDir = {
  src: "src",
  dist: "build",
};

/* Config */
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

export const clean = async () => del([ coreDir.dist ], { force: true });

export function stylesDev() {
  return src(config.styles.src, { sourcemaps: true })
    .pipe(sass().on("error", notify.onError()))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(dest(config.styles.dist))
    .pipe(browserSync.stream());
}

export function stylesBuild() {
  return src(config.styles.src)
    .pipe(sass().on("error", notify.onError()))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(autoPrefixer({ overrideBrowserslist: ['last 5 versions'], grid: true }))
    .pipe(cleanCss({ level: { 1: { specialComments: 1 } } }))
    .pipe(dest(config.styles.dist));
}

export function scriptsDev() {
  return src(config.scripts.src, { sourcemaps: true })
    .pipe(babel())
    .pipe(dest(config.scripts.dist))
    .pipe(browserSync.stream());
}

export function scriptsBuild() {
  return src(config.scripts.src)
    .pipe(babel())
    .pipe(dest(config.scripts.dist))
}

export function scriptsLibs() {
  return src(config.scriptLibs.src)
    .pipe(webpackStream(webpackConfig), webpack({ watch: true }))
    .pipe(dest(config.scriptLibs.dist))
    .pipe(browserSync.stream());
}

export function pugDev() {
  return src(config.pug.src)
    .pipe(plumber())
    .pipe(pug().on("error", notify.onError()))
    .pipe(plumber.stop())
    .pipe(dest(config.pug.dist))
    .pipe(browserSync.reload({ stream: true }))
}

export function pugBuild() {
  return src(config.pug.src)
    .pipe(plumber())
    .pipe(pug({ pretty: true }).on("error", notify.onError()))
    .pipe(plumber.stop())
    .pipe(dest(config.pug.dist));
}

export function copyFonts() {
  return src(config.fonts.watch, { encoding: false })
    .pipe(dest(config.fonts.dist))
    .pipe(browserSync.reload({ stream: true }))
}

export function copyImages() {
  return src(config.img.watch, { encoding: false })
    .pipe(dest(config.img.dist))
    .pipe(browserSync.reload({ stream: true }))
}

export function copySvg() {
  return src(config.svg.src, { encoding: false })
    .pipe(dest(config.svg.dist))
}

async function copyResources() {
  copyFonts()
  copyImages()
  copySvg()
}

export function watchFiles() {
  watch(config.styles.watch, stylesDev);
  watch(config.scripts.watch, scriptsDev);
  watch(config.scriptLibs.watch, scriptsLibs);
  watch(config.img.watch, copyImages);
  watch(config.fonts.watch, copyFonts);
  watch(config.pug.watch, pugDev);
}

export function browsersync() {
  browserSync.init({
    server: {
      baseDir: './build/',
      serveStaticOptions: {
        extensions: ['html'],
      },
    },
    port: 8080,
    ui: { port: 8081 },
    open: true,
  })
}

export function svgSprites() {
  return src("src/sources/svg/*.svg")
    .pipe(
      svgSprite({
        mode: "symbols",
      })
    )
    .pipe(dest("src"));
}

export function imgWebp() {
  const stream = gulp
    .src("./src/sources/img/**/*.{jpg,png}", { encoding: false })
    .pipe(
      imageMin({
        progressive: true,
        verbose: true,
        plugins: webp({ quality: 70 }),
      })
    )
    .pipe(extReplace(".webp"))
    .pipe(dest("./src/img"));
  return stream;
}

const gulpDev = gulp.series(clean, gulp.parallel(pugDev, stylesDev, scriptsDev, scriptsLibs, copyResources, browsersync, watchFiles));
export default gulpDev;

const build = gulp.series(clean, gulp.parallel(pugBuild, stylesBuild, scriptsBuild, scriptsLibs, copyResources));
export { build };