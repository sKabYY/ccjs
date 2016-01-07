var testConfig = {
    utils: [ 'utils/utils.js' ],
    coreTest: [
        'unit/core-test.js',
        'unit/eval-test.js',
        'unit/class-test.js',
        'unit/mixin-test.js',
        'unit/events-test.js',
        'unit/model-test.js',
        'unit/collection-test.js'
    ],
    jWebTest: [
        'unit/DomBiBinder-test.js'
    ]
};

(function () {
    if (typeof module !== 'undefined') {
        module.exports = testConfig;
    }
})();
