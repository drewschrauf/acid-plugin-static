import AcidPluginStatic, { __RewireAPI__ as ARewireAPI } from '../src/AcidPluginStatic';
import path from 'path';
import { expect } from 'chai';

describe('AcidPluginStatic', () => {
    it('should throw an error when no templateDir supplied', () => {
        expect(() => {
            new AcidPluginStatic();
        }).to.throw('requires a templateDir');
    });

    it('should return a plugin', () => {
        let a = new AcidPluginStatic({templateDir: 'templ'});
        expect(a.name).to.equal('static');
        expect(a.resolver.resolveContext).to.not.be.undefined;
        expect(a.resolver.resolveRoutes).to.not.be.undefined;
        expect(a.resolver.resolveTemplate).to.not.be.undefined;
    });

    describe('#resolveRoutes', () => {
        it('should return routes', done => {
            ARewireAPI.__set__('recursive', (dir, cb) => {
                let routes = ['templ/homepage.marko', 'templ/homepage.marko.js', 'templ/index.marko', 'templ/about/index.marko'].map(route => {
                    return path.resolve(route);
                });
                cb(null, routes);
            });
            let a = new AcidPluginStatic({templateDir: 'templ'});
            a.resolver.resolveRoutes().then(routes => {
                expect(routes).to.eql(['/homepage.html', '/', '/about']);
                done();
            });
        });

        it('should add an index if generateListing is true', done => {
            ARewireAPI.__set__('recursive', (dir, cb) => {
                let routes = ['templ/homepage.marko'].map(route => {
                    return path.resolve(route);
                });
                cb(null, routes);
            });
            let a = new AcidPluginStatic({templateDir: 'templ', generateListing: true});
            a.resolver.resolveRoutes().then(routes => {
                expect(routes).to.eql(['/homepage.html', '/']);
                done();
            });
        });
    });

    describe('#resolveContext', () => {
        it('should return null for non-listings', () => {
            let a = new AcidPluginStatic({templateDir: 'templ', generateListing: true});
            expect(a.resolver.resolveContext('/homepage.html')).to.be.null;
        });

        it('should return a template list for listings', done => {
            ARewireAPI.__set__('recursive', (dir, cb) => {
                let routes = ['templ/homepage.marko'].map(route => {
                    return path.resolve(route);
                });
                cb(null, routes);
            });
            let a = new AcidPluginStatic({templateDir: 'templ', generateListing: true});
            a.resolver.resolveContext('/').then(context => {
                expect(context).to.eql(['/homepage.html']);
                done();
            });
        });
    });

    describe('#resolveTemplate', () => {
        it('should return the template path for an html route', () => {
            let a = new AcidPluginStatic({templateDir: 'dir', generateListing: true});
            expect(a.resolver.resolveTemplate('/homepage.html')).to.contain('/homepage.marko');
        });

        it('should return the template for an index route', () => {
            let a = new AcidPluginStatic({templateDir: 'dir', generateListing: true});
            expect(a.resolver.resolveTemplate('/about')).to.contain('/about/index.marko');

        });
        it('should return the listing template for an index route with generateListing is true', () => {
            let a = new AcidPluginStatic({templateDir: 'dir', generateListing: true});
            expect(a.resolver.resolveTemplate('/')).to.contain('/listing.marko');
        });
    });
});
