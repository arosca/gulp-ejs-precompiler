'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var ejs = require('ejs');

module.exports = function (options) {
    options = options || {};
    var templateVarName = options.templateVarName || 'templates';
    delete options.templateVarName;

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit(
                'error',
                new gutil.PluginError('gulp-ejs-precompiler', 'Streaming not supported')
            );
            return cb();
        }

        options.filename = options.filename || file.path;
        try {
            var contents = file.contents.toString();
            var compiledFunction = ejs.compile(contents, options).toString();
            var prefix = templateVarName + '[' + JSON.stringify(file.path.substring(file.base.length, file.path.length - 4)) +'] = ';
            var suffix = ';'
            compiledFunction = prefix + compiledFunction + suffix;
            file.contents = new Buffer(compiledFunction);
            file.path = gutil.replaceExtension(file.path, '.js');
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-ejs-precompiler', err.toString()));
        }

        this.push(file);
        cb();
    });
};