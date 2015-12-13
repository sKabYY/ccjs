#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var dist_root = 'dist';
var base_path = 'src';

var core = 'core/core.js';
var modules = [
    'class/class.js'
];

var read_src = function (file) {
    var p = path.join(base_path, file);
    return fs.readFileSync(p, 'utf8');
};

var core_src = read_src(core);
var buf = [core_src];
for (var i = 0; i < modules.length; ++i) {
    (function (m) {
        var src = read_src(m);
        var new_src = '\n' +
            '// file: ' + m + '\n' +
            '(function (cc) {\n\n' +
            '' + src + '\n' +
            '})(cc);';
        buf.push(new_src);
    })(modules[i]);
}

if (!fs.existsSync(dist_root)) {
    fs.mkdirSync(dist_root);
}

var dist_src = buf.join('\n');
fs.writeFileSync(
    path.join(dist_root, 'cc.core.js'),
    dist_src,
    'utf8');
