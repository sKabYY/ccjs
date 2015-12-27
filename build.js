#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var dist_root = 'dist';
var base_path = 'src';

var core = 'core/core.js';
var modules = [
    'class/class.js',
    'class/mixin.js',
    'class/events.js',
    'class/attributes.js'
];
var jWebModules = [
    'jWeb/ViewModel.js'
];

if (!fs.existsSync(dist_root)) {
    fs.mkdirSync(dist_root);
}

var read_src = function (file) {
    var p = path.join(base_path, file);
    return fs.readFileSync(p, 'utf8');
};

var build_modules = function (fn, ms, buf) {
    var buf = buf || [];
    for (var i = 0; i < ms.length; ++i) {
        (function (m) {
            var src = read_src(m);
            var new_src = '' +
                '// file: ' + m + '\n' +
                '(function (cc) {\n\n' +
                '' + src + '\n' +
                '})(cc);\n';
            buf.push(new_src);
        })(ms[i]);
    }
    var dist_src = buf.join('\n');
    fs.writeFileSync(
        path.join(dist_root, fn),
        dist_src,
        'utf8');
};

var build_core = function () {
    var core_src = read_src(core);
    build_modules('cc.core.js', modules, [core_src + '\n']);
};

var build_jWeb = function () {
    build_modules('cc.jWeb.js', jWebModules);
};

build_core();
build_jWeb();

try {
    console.log('\nRunning tests...');
    require('./test/nodejs-test');
} catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
        // Re-throw not "Module not found" errors
        throw e;
    }
    if (e.message.indexOf('\'express\'') === -1) {
        // Re-throw not found errors for other modules
        throw e;
    }
    console.log('No tests found.');
}
