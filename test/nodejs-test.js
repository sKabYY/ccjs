var testConfig = require('./config.js');
cc = require('../dist/cc.core.js');

var Tester = (function () {
    var assertions = 0;
    var passed = 0;
    var mkAssert = function (testname) {
        var fail = function (message, extraMsg, stack) {
            message = message || 'fail';
            extraMsg = extraMsg || 'fail';
            console.error('[' + testname + ']/[' + message + '] ' + extraMsg);
            console.error(stack);
        };
        var doAssert = function (result, message, extraMsg) {
            ++assertions;
            if (!result) {
                fail(message, extraMsg, new Error().stack);
            } else {
                ++passed;
            }
        };
        return {
            ok: function (result, message) {
                doAssert(result, message, 'result=' + result);
            },
            equal: function (actual, expected, message) {
                doAssert(actual === expected, message,
                    'expected=' + expected + ', actual=' + actual);
            },
            notEqual: function (actual, expected, message) {
                doAssert(actual !== expected, message,
                    'result=' + expected);
            }
        };
    };
    var printSummary = function () {
        console.log(
            assertions + ' assertions of ' +
            passed + ' passed, ' +
            (assertions - passed) + ' failed.');
    };
    return {
        mkAssert: mkAssert,
        printSummary: printSummary
    };
})();

QUnit = {
    test: function (testname, testproc) {
        testproc(Tester.mkAssert(testname));
    }
};

var runScript = function (fn) {
    if (!fn.startsWith('./')) {
        fn = './' + fn;
    }
    require(fn);
};

['utils', 'coreTest'].each(function (m) {
    var scripts = testConfig[m];
    if (cc.isString(scripts)) {
        runScript(scripts);
    } else {
        scripts.each(function (script) {
            runScript(script);
        });
    }
});
Tester.printSummary();
