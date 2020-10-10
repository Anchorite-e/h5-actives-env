const gulp = require('gulp'),
    htmlMin = require('gulp-htmlmin'),
    runSequence = require('run-sequence'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    cleanCss = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    browserSync = require('browser-sync').create(),
    preprocess = require('gulp-preprocess'),
    minimist = require('minimist'),
    babelHtml = require('babel-html-inline'),
    scssInline = require('gulp-scss-inline');

const config = require('./config');

/**
 * 修改文件配置路径：注意变量对应
 * 默认源文件路径 src： srcDir = 'src';
 * 默认生成文件路径 dist： targetDir = 'dest';
 * 默认处理所有html文件：targetHtml = '*.html';
 * 默认js生产文件路径 dist/js/：jsTargetDir = targetDir + '/js';
 * 默认css生产文件路径 dist/css/：cssTargetDir = targetDir + '/css';
 */

let srcDir = 'src';         //配置源文件路径
let targetDir = 'dist';     //配置目标文件路径

let sass2Filename = 'style.css';    //配置sass处理后合成生成的文件

let jsTargetDir = targetDir + '/js';
let cssTargetDir = targetDir + '/css';

let targetHtml = '*.html';      //配置html文件名称，可以指定为某个文件 如：jumpAli.html

let port = 10001;

let _defaultENV = 'dev';

let _env = {
    string: 'env',
    default: {env: process.env.NODE_ENV || _defaultENV}
};

let _path = {
    string: 'path',
    default: {path: srcDir}
};
let _output = {
    string: 'output',
    default: {output: targetDir}
};
let _arguments = {
    _env: minimist(process.argv.slice(2), _env),
    _path: minimist(process.argv.slice(2), _path),
    _output: minimist(process.argv.slice(2), _output)
};

srcDir = _arguments._path.path;
targetDir = _arguments._output.output;
jsTargetDir = targetDir + '/js';
cssTargetDir = targetDir + '/css';


let currentEnv = _arguments._env.env;
currentEnv = currentEnv.length === 3 && /(dev)|(pre)|(pdt)/i.test(currentEnv) ? currentEnv : _defaultENV;

/********************************独立使用**************************************/

// 简单混淆js
gulp.task('serve_js', () =>
    gulp.src(srcDir + '/**/*.js')
        .pipe(preprocess({
            context: {
                NODE_ENV: currentEnv,
                ...config
            }
        }))
        .pipe(uglify())
        .pipe(gulp.dest(targetDir))
);

// js文件 babel转码、混淆 文件名含『min.』不处理
gulp.task('serve_babel', () =>
    gulp.src(srcDir + '/**/*.js')
        .pipe(preprocess({
            context: {
                NODE_ENV: currentEnv,
                ...config
            }
        }))
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest(targetDir))
);

// 内联script标签代码babel转码
gulp.task('babelInline', () =>
    gulp.src([srcDir + '/**/' + targetHtml])
        .pipe(babelHtml())
        .pipe(gulp.dest(targetDir))
);

// 内联样式 sass预处理
gulp.task('scssInline', () =>
    gulp.src([srcDir + '/**/' + targetHtml])
        .pipe(scssInline())
        .pipe(gulp.dest(targetDir))
);


// 常规scss文件预处理
gulp.task('serve_sass', () =>
    gulp.src(srcDir + '/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(srcDir))
);

// css文件添加前缀
gulp.task('serve_css', ['serve_sass'], () =>
    gulp.src(srcDir + '/**/*.css')
        .pipe(autoprefixer({
            overrideBrowserslist: [
                "> 1%",
                "ie >= 8",
                "edge >= 15",
                "ie_mob >= 10",
                "ff >= 45",
                "chrome >= 45",
                "safari >= 7",
                "opera >= 23",
                "ios >= 7",
                "android >= 4",
                "bb >= 10"
            ]
        }))
        .pipe(cleanCss({compatibility: 'ie8'}))
        // .pipe(concat(sass2Filename))     //样式文件合成
        .pipe(gulp.dest(targetDir))
);


/********************************END**************************************/

// 行内 sass、 es6处理综合
gulp.task('inlineOperation', () =>
    gulp.src([srcDir + '/**/' + targetHtml])
        .pipe(preprocess({
            context: {
                NODE_ENV: currentEnv,
                ...config
            }
        }))
        .pipe(scssInline())
        .pipe(babelHtml())
        .pipe(gulp.dest(targetDir))
);

gulp.task('buildHtmlMin', () => {
    let options = {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: false,
        removeEmptyAttributes: false,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true
    };
    gulp.src([targetDir + '/**/' + targetHtml])
        .pipe(preprocess({
            context: {
                NODE_ENV: currentEnv,
                ...config
            }
        }))
        .pipe(htmlMin(currentEnv !== 'dev' ? options : {}))
        .pipe(gulp.dest(targetDir));
});

gulp.task('moveAssets', () =>
    gulp.src([
        srcDir + '/**/*.*',
        '!' + srcDir + '/**/*.html',
        '!' + srcDir + '/**/*.js',
        '!' + srcDir + '/**/*.css',
        '!' + srcDir + '/**/*.scss',
    ])
        .pipe(gulp.dest(targetDir))
);

gulp.task('hash2Assets', ['moveAssets'], () =>
    gulp.src([
        srcDir + '/**/*.*',
        '!' + srcDir + '/**/*.html',
        '!' + srcDir + '/**/*.js',
        '!' + srcDir + '/**/*.css',
        '!' + srcDir + '/**/*.scss'
    ])
        .pipe(rev())
        .pipe(gulp.dest(targetDir))
        .pipe(rev.manifest())
        .pipe(gulp.dest(targetDir))
);

gulp.task('hash2css', () =>
    gulp.src(cssTargetDir + '/**/*.css')
        .pipe(rev())
        .pipe(gulp.dest(cssTargetDir))
        .pipe(rev.manifest())
        .pipe(gulp.dest(cssTargetDir))
);

gulp.task('hash2js', () =>
    gulp.src(jsTargetDir + '/**/*.js')
        .pipe(rev())
        .pipe(gulp.dest(jsTargetDir))
        .pipe(rev.manifest())
        .pipe(gulp.dest(jsTargetDir))
);

gulp.task('hash2htmlWithCss', ['hash2css'], () =>
    gulp.src([cssTargetDir + '/rev-manifest.json', targetDir + '/**/' + targetHtml])
        .pipe(revCollector())
        .pipe(gulp.dest(targetDir))
);

gulp.task('hash2htmlWithJs', ['hash2js'], () =>
    gulp.src([jsTargetDir + '/rev-manifest.json', targetDir + '/**/' + targetHtml])
        .pipe(revCollector())
        .pipe(gulp.dest(targetDir))
);

gulp.task('hash2htmlWithAssets', ['hash2Assets'], () =>
    gulp.src([targetDir + '/rev-manifest.json', targetDir + '/**/' + targetHtml])
        .pipe(revCollector())
        .pipe(gulp.dest(targetDir))
);


gulp.task('rmHashJson', () =>
    del([
        targetDir + '/**/rev-manifest.json'
    ], {force: true})
);

gulp.task('log', () => {
    setTimeout(() => {
        console.log('当前代码环境：' + currentEnv);
        console.log('当前源文件夹：' + srcDir);
        console.log('当前输出文件夹：' + targetDir);
    }, 200);
});

gulp.task('freshFiles', (done) => {
    runSequence(
        ['inlineOperation'],
        ['serve_babel'],
        ['serve_css'],
        ['moveAssets'],
        ['hash2Assets'],
        ['hash2htmlWithCss'],
        ['hash2htmlWithJs'],
        ['hash2htmlWithAssets'],
        ['rmHashJson'],
        done);
});

/********************************综合功能**************************************/

gulp.task('page', async () => {
    await browserSync.init({
        port: port,
        server: {
            baseDir: [srcDir],
            index: targetHtml === '*.html' ? 'index.html' : targetHtml
        },
        watch: true,
        notify: false
    });
    gulp.watch(srcDir + '/**/*.*').on('change', browserSync.reload);
    runSequence(['log']);
});

gulp.task('dev', ['freshFiles'], () => {
    browserSync.init({
        port: port,
        server: {
            baseDir: [targetDir],
            index: targetHtml === '*.html' ? 'index.html' : targetHtml
        },
        watch: true,
        notify: false
    });
    gulp.watch(srcDir + '/**/*.*', ['freshFiles']);
    runSequence(['log']);
});

gulp.task('build', (done) => {
    if (!process.argv.includes('--env')) {
        currentEnv = 'pdt'
    }
    delDirector(targetDir);
    setTimeout(() => {
        runSequence(['freshFiles'], ['buildHtmlMin'], ['log'], done);
    }, 1000)
});

gulp.task('default', ['build'])

/********************************END**************************************/

function delDirector(path) {
    del(path, {force: true})
}

function getServerIp() {
    let os = require('os');
    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        if (interfaces.hasOwnProperty(devName)) {
            let iFace = interfaces[devName];
            for (let i = 0; i < iFace.length; i++) {
                let alias = iFace[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    }
}
