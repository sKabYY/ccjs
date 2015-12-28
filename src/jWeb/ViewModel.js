cc.ViewModel = cc.Class.new(function (self) {

    var model = undefined;
    var processors = [];

    var process = function ($el) {
        processors.each(function (processor) {
            if (processor.match($el)) {
                processor.process($el);
            }
        });
    };

    var registerProcessor = function (typename, selector, proc) {
        var type = 'cc-' + typename;
        var processor = {
            match: function ($el) {
                return $el.attr(type) !== undefined && $el.is(selector);
            },
            process: function ($el) {
                var attrValue = $el.attr(type);
                proc($el, attrValue);
            }
        };
        processors.push(processor);
    };

    registerProcessor('model', 'input,textarea', function ($el, attrValue) {
        var setVal = function () {
            var value = model.get(attrValue);
            if (value === undefined) {
                value = '';
            }
            $el.val(value);
        };
        setVal();
        model.on('change:' + attrValue, function (_, _, $owner) {
            if (!(cc.instanceOf($owner, $) && $owner.is($el))) {
                setVal();
            }
        });
        $el.on('input change propertychange', function() {
            model.set(attrValue, $el.val(), { extra: $el });
        });
    });

    registerProcessor('bind', '*', function ($el, attrValue) {
        var setHtml = function (scope) {
            var value = model.get(attrValue);
            if (cc.isFunction(value)) {
                value = value(scope);
            }
            if (value === undefined) {
                value = '';
            }
            $el.html(value);
        };
        var registerChangeEvent = function (key) {
            model.on('change:' + key, function () {
                setHtml(model.get);
            });
        };
        setHtml((function () {
            var dependencies = {};
            return function (key) {
                if (!dependencies[key]) {
                    registerChangeEvent(key);
                    dependencies[key] = true;
                }
                return model.get(key);
            };
        })());
        registerChangeEvent(attrValue);
    });

    return {

        initialize: function (m) {
            if (cc.instanceOf(m, cc.Model)) {
                model = m;
            } else {
                model = cc.Model.new(m);
            }
        },

        bibind: function (view) {
            var $view = $(view);
            $.merge($view.find('*'), $view).each(function(i, el) {
                process($(el));
            });
            return self;
        },

        set: function () {
            model.set.apply(model, arguments);
        },

        get: function () {
            model.get.apply(model, arguments);
        }

    };

});
