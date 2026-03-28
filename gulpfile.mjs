import fs from "node:fs";
import path from "node:path";

import { src, dest, watch, series, parallel } from "gulp";
import sourcemaps from "gulp-sourcemaps";
import autoPrefixer from "gulp-autoprefixer";
import gulpCleanCss from "gulp-clean-css";
import terser from "gulp-terser";
import htmlmin from "gulp-htmlmin";
import browserSyncLink from "browser-sync";
import concat from "gulp-concat";
import { deleteAsync } from "del";
import imageminPngquant from "imagemin-pngquant";
import imagemin, { mozjpeg, svgo, optipng } from "gulp-imagemin";
import rename from "gulp-rename";
import chalk from "chalk";

const browserSync = browserSyncLink.create();

const PORT = 9000;

/**@description Пути к папкам */
const paths = {
  html: {
    src: "src/*.html",
    dest: "dist/",
  },
  styles: {
    src: "src/styles/*.css",
    dest: "dist/styles/",
  },
  images: {
    src: "src/images/**/*.{png,jpeg,jpg,svg}",
    dest: "dist/images/",
  },
  fonts: {
    src: "src/fonts/*.woff2",
    dest: "dist/fonts/",
  },
  scripts: {
    src: "src/js/**/*.js",
    dest: "dist/js/",
  },
};

/**@description Определение начальной конфигурации browserSync */
export function serve() {
  browserSync.init(
    {
      server: {
        baseDir: "dist/",
      },
      port: 9000,
      open: false,
      logPrefix: "crossfit".toUpperCase(),
      online: true,
      browser: ["google chrome", "firefox"],
      notify: false,
    },
    () => {
      console.log(
        chalk.greenBright(
          `browserSync настроен и прослушивает порт: ${chalk.underline.bold(
            `${PORT}`
          )}`
        )
      );
    }
  );
  watch(paths.html.src, html);
  watch(paths.styles.src, styles);
  watch(paths.scripts.src, scripts);
  watch(paths.images.src, images);
}

/**@description Очистка папки for production --> dist */
export async function clean() {
  return await deleteAsync(["dist/**", "!dist"]);
}

/**@description Подключение внешних скриптов */
export function scriptlibs() {
  return src(["./node_modules/swiper/swiper-bundle.min.js"])
    .pipe(concat("lib.min.js"))
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

/**@description скрипты приложения */
export function scripts() {
  return src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(concat("app.min.js"))
    .pipe(terser())
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

export function copyFonts() {
  return src(paths.fonts.src, { encoding: false }).pipe(dest(paths.fonts.dest));
}

/**@description минификация html files */
export function html() {
  return src(paths.html.src)
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
      })
    )
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

/**@description Поддключение внешних таблиц стилей в проект */
export function stylelibs() {
  return src(["./node_modules/swiper/swiper-bundle.min.css"])
    .pipe(concat("lib.min.css"))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

/**@description добавление вендорных префиксов и минификация CSS */
export function styles() {
  return src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(autoPrefixer({ cascade: false }))
    .pipe(gulpCleanCss({ level: 2 }))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

/**@description Оптимизация изображений с помощью нативного Imagemin */
export function images() {
  return src(paths.images.src, { encoding: false })
    .pipe(
      imagemin([
        mozjpeg({ quality: 60, progressive: true }),
        imageminPngquant({
          speed: 2,
          quality: 60 - 80,
          strip: true,
          dithering: 0.5,
        }),

        optipng({
          optimizationLevel: 7,
          bitDepthReduction: true,
          colorTypeReduction: true,
          paletteReduction: true,
        }),
        svgo({
          plugins: [{ name: "removeViewBox", active: false }],
        }),
      ])
    )
    .pipe(dest(paths.images.dest))
    .pipe(browserSync.stream());
}

async function logImageSizes() {
  const srcDir = "src/images";
  const distDir = "dist/images";
  const files = await fs.promises.readdir(srcDir, {
    encoding: "utf-8",
    recursive: true,
  });
  const pngFiles = files.filter((filename) => filename.endsWith(".png"));
  const svgFiles = files.filter((filename) => filename.endsWith(".svg"));
  const jpegFiles = files.filter(
    (filename) => filename.endsWith(".jpeg") || filename.endsWith(".jpg")
  );
  console.log();
  console.log(chalk.blueBright.bold("Отчет об оптимизации PNG:"));
  for (let pngFile of pngFiles) {
    let srcPngFilepath = path.join(srcDir, pngFile);
    let distPngFilepath = path.join(distDir, pngFile);

    try {
      const srcFileStat = await fs.promises.stat(srcPngFilepath);
      const distFileStat = await fs.promises.stat(distPngFilepath);
      const srcSize = srcFileStat.size;
      const distSize = distFileStat.size;
      const savings = (((srcSize - distSize) / srcSize) * 100).toFixed(2);
      console.log(
        `${pngFile}: ${(srcSize / 1024).toFixed(2)}Kb \u2192 ${(
          distSize / 1024
        ).toFixed(2)}Kb Сжато на ${chalk.blueBright.bold(
          `${savings}%`
        )}\ и успешно сохранено`
      );
    } catch (err) {
      console.log(
        chalk.red.bold(
          `Ошибка в процессе сжатия файла: ${pngFile}`,
          err.message
        )
      );
    }
  }
  console.log();
  console.log(chalk.blueBright.bold("Отчет об оптимизации SVG:"));
  for (let svgFile of svgFiles) {
    let srcFilepath = path.join(srcDir, svgFile);
    let distFilepath = path.join(distDir, svgFile);

    try {
      let srcFileStat = await fs.promises.stat(srcFilepath);
      let distFileStat = await fs.promises.stat(distFilepath);
      let srcSize = srcFileStat.size;
      let distSize = distFileStat.size;
      let saving = (((srcSize - distSize) / srcSize) * 100).toFixed(2);
      console.log(
        `${svgFile} ${(srcSize / 1024).toFixed(2)}Kb \u2192 ${(
          distSize / 1024
        ).toFixed(2)}Kb Сжато на ${chalk.bold.blueBright(
          `${saving}%`
        )} и успешно сохранено`
      );
    } catch (err) {
      console.log(
        chalk.red.bold(
          `Ошибка в процессе сжатия файла ${svgFile}: `,
          err.message
        )
      );
    }
  }
  console.log();
  console.log(chalk.blueBright.bold("Отчет об оптимизации JPEG/JPG:"));
  for (let jpegFile of jpegFiles) {
    let srcFilepath = path.join(srcDir, jpegFile);
    let distFilepath = path.join(distDir, jpegFile);

    try {
      let srcFileStat = await fs.promises.stat(srcFilepath);
      let distFileStat = await fs.promises.stat(distFilepath);
      let srcSize = srcFileStat.size;
      let distSize = distFileStat.size;
      let saving = (((srcSize - distSize) / srcSize) * 100).toFixed(2);
      console.log(
        `${jpegFile} ${(srcSize / 1024).toFixed(2)}Kb \u2192 ${(
          distSize / 1024
        ).toFixed(2)}Kb Сжато на ${chalk.bold.blueBright(
          `${saving}%`
        )} и успешно сохранено`
      );
    } catch (err) {
      console.log(
        chalk.red.bold(
          `Ошибка в процессе сжатия файла ${jpegFile}: `,
          err.message
        )
      );
    }
  }
  console.log();
}

export const build = series(
  clean,
  parallel(stylelibs, scriptlibs, html, copyFonts, styles, scripts, images),
  logImageSizes
);
export default series(build, serve);
