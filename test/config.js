var testConfig = {
    utils: 'utils/utils.js',
    coreTest: [
        'unit/core-test.js',
        'unit/class-test.js',
        'unit/mixin-test.js',
        'unit/eventuality-test.js'
    ]
};

(module || {}).exports = testConfig;
