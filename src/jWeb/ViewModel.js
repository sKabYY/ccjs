cc.ViewModel = cc.Model.Extends(function (self) {

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
            var value = self.get(attrValue);
            if (value === undefined || value === null) {
                value = '';
            }
            $el.val(value);
        };
        setVal();
        self.on('change:' + attrValue, function (_, _, $owner) {
            if (!$owner.is($el)) {
                setVal();
            }
        });
        $el.on('input change propertychange', function() {
            self.set(attrValue, $el.val(), { extra: $el });
        });
    });

    registerProcessor('bind', '*', function ($el, attrValue) {
        var setHtml = function (scope) {
            var value = self.get(attrValue);
            if (cc.isFunction(value)) {
                value = value(scope);
            }
            if (value === undefined || value === null) {
                value = '';
            }
            $el.html(value);
        };
        var registerChangeEvent = function (key) {
            self.on('change:' + key, function () {
                setHtml(vm);
            });
        };
        var dependencies = {};
        setHtml((function () {
            return {
                get: function (key) {
                    if (!dependencies[key]) {
                        dependencies[key] = true;
                        registerChangeEvent(key);
                    }
                    return vm.get(key);
                }
            };
        })());
        registerChangeEvent(attrValue);
    });

    return {

        initialize: function (attrs) {
            self.super.initialize(attrs);
        },

        bibind: function (view) {
            var $view = $(view);
            $.merge($view.find('*'), $view).each(function(i, el) {
                process($(el));
            });
        }

    };

});
