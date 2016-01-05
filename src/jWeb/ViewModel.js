cc.ViewModel = cc.Class.new(function (self) {

    var model = undefined;
    var processors = [];

    var bibind = function (ctx, $view) {
        $.merge($view.find('*'), $view).each(function(_, el) {
            var $el = $(el);
            processors.each(function (processor) {
                if (processor.match($el)) {
                    processor.process(ctx, $el);
                }
            });
        });
    };

    var typeNameToAttr = function (typename) {
        return 'cc-' + typename;
    };

    var registerProcessor = function (typename, selector, proc) {
        var attr = typeNameToAttr(typename);
        var processor = {
            match: function ($el) {
                return $el.attr(attr) !== undefined && $el.is(selector);
            },
            process: function (ctx, $el) {
                var attrValue = $el.attr(attr);
                proc(ctx, $el, attrValue);
            }
        };
        processors.push(processor);
    };

    registerProcessor('model', 'input,textarea', function (ctx, $el, attrValue) {
        var setVal = function () {
            var value = ctx.get(attrValue);
            if (value === undefined) {
                value = '';
            }
            $el.val(value);
        };
        setVal();
        ctx.on('change:' + attrValue, function (_, _, $owner) {
            if (!(cc.instanceOf($owner, $) && $owner.is($el))) {
                setVal();
            }
        });
        $el.on('input change propertychange', function() {
            ctx.set(attrValue, $el.val(), { extra: $el });
        });
    });

    registerProcessor('bind', '*', function (ctx, $el, attrValue) {
        var setHtml = function (scope) {
            var value = ctx.get(attrValue);
            if (cc.isFunction(value)) {
                value = value(scope);
            }
            if (value === undefined) {
                value = '';
            }
            $el.html(value);
        };
        var registerChangeEvent = function (key) {
            ctx.on('change:' + key, function () {
                setHtml(ctx.get);
            });
        };
        setHtml((function () {
            var dependencies = {};
            return function (key) {
                if (!dependencies[key]) {
                    registerChangeEvent(key);
                    dependencies[key] = true;
                }
                return ctx.get(key);
            };
        })());
        registerChangeEvent(attrValue);
    });

    registerProcessor('template', '*', function (ctx, $el, attrValue){
        var template = $(attrValue).html();
        var dsName = $el.attr(typeNameToAttr('datasource'));
        var array = ctx.get(dsName);
        // TODO: if array is a collection
        var ds = array;
        if (ds) {
            var onAdded = function (m) {
                var $dom = $(template);
                bibind(m, $dom);
                $el.append($dom);
            };
            if (!cc.instanceOf(ds, cc.Collection)) {
                ds = cc.Collection.new();
                $el.empty();
                array.each(function (d) {
                    ds.add(d);
                });
                ctx.set(dsName, ds, { silence: true });
            }
            ds.each(function (m) {
                onAdded(m);
            }).on('add', onAdded);
        }
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
            bibind(model, $view);
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
