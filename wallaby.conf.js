process.env.BABEL_ENV = 'test';
var babel = require('babel-core');

module.exports = function(wallaby) {
    return {
        files: ['src/**/*.js', 'listing.marko'],
        tests: ['test/**/*Spec.js'],
        env: {
            type: 'node'
        },
        compilers: {
            '**/*.js': wallaby.compilers.babel({
                babel: babel
            })
        }
    };
};
