var gulp = require("gulp"),
  del = require("del"),
  sass = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  cleancss = require("gulp-clean-css"),
  rename = require("gulp-rename");

const compile = () => {
  return (
    gulp
      .src("../sass/theme.scss")
      .pipe(
        sass({
          includePaths: ["./node_modules"]
        })
      )
      .on("error", sass.logError)
      .pipe(
        autoprefixer()
      )
      // Uncomment in case you need/want to minify your final CSS
      /*
      .pipe(cleancss({ rebase: false, level: { 1: { specialComments: 0 } } }))
	  .pipe(rename({ suffix: ".min" }))
	  */
      .pipe(gulp.dest("./css"))
  );
};

const clean = () => {
  return del(["./css/*.css"]);
};

exports.sass = compile;
exports.clean = clean;

var build = gulp.series(clean, compile);

gulp.task("default", build);
