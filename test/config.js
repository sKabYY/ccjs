var testConfig = {
    utils: 'utils/utils.js',
    coreTest: [
        'unit/core-test.js',
        'unit/class-test.js',
        'unit/mixin-test.js',
        'unit/events-test.js',
        'unit/attributes-test.js'
    ]
};

(function () {
    if (typeof module !== 'undefined') {
        module.exports = testConfig;
    }
})();
