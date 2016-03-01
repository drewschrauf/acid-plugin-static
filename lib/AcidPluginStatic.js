'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (options) {
    options = options || {};
    if (!options.templateDir) {
        throw new Error('acid-plugin-static requires a templateDir');
    }

    var templateDir = _path2.default.resolve(options.templateDir);
    var generateListing = !!options.generateListing;

    return {
        name: 'static',
        resolver: {
            resolveContext: function resolveContext(route) {
                if (generateListing && route === '/') {
                    return getRouteList(templateDir);
                } else {
                    return null;
                }
            },
            resolveRoutes: function resolveRoutes() {
                return getRouteList(templateDir).then(function (routes) {
                    if (generateListing && ! ~routes.indexOf('/')) {
                        routes.push('/');
                    }
                    return routes;
                });
            },
            resolveTemplate: function resolveTemplate(url) {
                if (generateListing && url === '/') {
                    return require.resolve('../listing.marko');
                } else {
                    var p = _path2.default.parse(url);
                    if (!p.ext) {
                        return _path2.default.join(templateDir, url, 'index.marko');
                    } else {
                        return _path2.default.join(templateDir, p.dir, p.name + '.marko');
                    }
                }
            }
        }
    };
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _recursiveReaddir = require('recursive-readdir');

var _recursiveReaddir2 = _interopRequireDefault(_recursiveReaddir);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getRouteList(templateDir) {
    return new Promise(function (resolve, reject) {
        (0, _recursiveReaddir2.default)(templateDir, function (err, files) {
            if (err) return reject(err);
            resolve(files.filter(function (f) {
                return f.match(/\.marko$/);
            }).map(function (f) {
                f = f.replace(templateDir, '');
                var p = _path2.default.parse(f);

                if (p.base === 'index.marko') {
                    return p.dir;
                } else {
                    return _path2.default.join(p.dir, p.name + '.html');
                }
            }));
        });
    });
}