const { src, dest, watch, series } = require("gulp");
const nunjucksRender = require("gulp-nunjucks-render");
const data = require("gulp-data");
const clean = require("gulp-clean");
const sass = require("gulp-sass");
const uglifycss = require("gulp-uglifycss");
const browserSync = require("browser-sync").create();

sass.compiler = require("node-sass");

// Cleans dist folder
function cleanDist() {
  return src("dist/*", { read: false }).pipe(clean());
}

// move images
function imageTask() {
    return src('src/img/**/*.{gif,jpg,png,svg}')
    .pipe(dest('./dist/img'));
}

// Compile Sass files into css file
function sassTask() {
  return src("src/scss/**/*.scss", { sourcemaps: true })
    .pipe(sass())
    .pipe(dest("src/css"));
}

// uglify css file and copy to dist/css
function cssTask() {
  return src("src/css/*.css")
    .pipe(
      uglifycss({
        maxLineLen: 80,
        uglyComments: true,
      })
    )
    .pipe(dest("./dist/css/"));
}

// compile html into templates and into dist
function njhtml() {
  return src("src/pages/*.html")
    .pipe(
      data(function () {
        return require("./src/page_data.json");
      })
    )
    .pipe(nunjucksRender({ path: ["src/templates"] }))
    .pipe(dest("dist"));
}

// browser sync (live server)
function browserSyncServe(cb) {
    console.log("BrowserSync is starting... This might take some seconds...");
  browserSync.init({
    server: {
      baseDir: "dist",
    },
  });
  cb();
}

function browserSyncReload(cb) {
    browserSync.reload();
    cb();
}

// watchtask, run tasks on change while in live server and reload
function watchTask() {
  watch("src/scss/**/*.scss", series(sassTask, cssTask, browserSyncReload));
  watch("src/pages/*.html", series(njhtml, browserSyncReload));
  watch("src/templates/**/*.njk", series(njhtml, browserSyncReload));
}

// default task "gulp"
exports.default = series(cleanDist, imageTask, sassTask, cssTask, njhtml);
exports.watch = series(cleanDist, imageTask, sassTask, cssTask, njhtml, browserSyncServe, watchTask);
