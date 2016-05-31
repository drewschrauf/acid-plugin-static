import path from 'path';
import recursive from 'recursive-readdir';

function getRouteList(templateDir) {
    return new Promise((resolve, reject) => {
        recursive(templateDir, (err, files) => {
            if (err) return reject(err);
            resolve(files.filter(f => {
                return f.match(/\.marko$/);
            }).map(f => {
                f = f.replace(templateDir, '');
                let p = path.parse(f);

                if (p.base === 'index.marko') {
                    return p.dir;
                } else {
                    return path.join(p.dir, p.name + '.html');
                }
            }).map(f => f.replace(/\\/, '/')));
        });
    });
}

export default function(options) {
    options = options || {};
    if (!options.templateDir) {
        throw new Error('acid-plugin-static requires a templateDir');
    }

    let templateDir = path.resolve(options.templateDir);
    let generateListing = !!options.generateListing;

    return {
        name: 'static',
        resolver: {
            resolveContext: route => {
                if (generateListing && route === '/') {
                    return getRouteList(templateDir);
                } else {
                    return null;
                }
            },
            resolveRoutes: () => {
                return getRouteList(templateDir).then(routes => {
                    if (generateListing && !~routes.indexOf('/')) {
                        routes.push('/');
                    }
                    return routes;
                });
            },
            resolveTemplate: url => {
                if (generateListing && url === '/') {
                    return (require.resolve('../listing.marko'));
                } else {
                    let p = path.parse(url);
                    if (!p.ext) {
                        return path.join(templateDir, url, 'index.marko');
                    } else {
                        return path.join(templateDir, p.dir, p.name + '.marko');
                    }
                }
            }
        }
    };
}
