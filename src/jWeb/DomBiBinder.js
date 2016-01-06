cc.DomBiBinder = cc.Class.new(function (self) {

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
        ctx.on('change:' + attrValue, function (_, _, args) {
            if (!(cc.isObject(args) && cc.instanceOf(args.sender, $) && args.sender.is($el))) {
                setVal();
            }
        });
        $el.on('input change propertychange', function() {
            ctx.set(attrValue, $el.val(), { extra: { sender: $el } });
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
        var setCollection = function () {
            var array = ctx.get(dsName);
            var ds = array;
            var ATTR_MODEL_ID = 'cc-model-id';
            $el.empty();
            if (ds) {
                if (!cc.instanceOf(ds, cc.Collection)) {
                    ds = cc.Collection.new();
                    ds.add.apply(ds, array);
                    ctx.set(dsName, ds, { silence: true });
                }
                var onAdded = function (m) {
                    var $dom = $(template);
                    bibind(m, $dom);
                    $dom.attr(ATTR_MODEL_ID, m.id());
                    $el.append($dom);
                };
                ds.each(function (m) {
                    onAdded(m);
                }).on('add', function (ms) {
                    ms.each(onAdded);
                }).on('remove', function (ms) {
                    ms.each(function (m) {
                        $el.find('[{attrName}="{attrValue}"]'.format({
                            attrName: ATTR_MODEL_ID,
                            attrValue: m.id()
                        })).remove();
                    });
                });
            }
        };
        ctx.on('change:' + dsName, function () {
            setCollection();
        });
        setCollection();
    });

    return {
        bibind: function (model, view) {
            if (!cc.instanceOf(model, cc.Model)) {
                model = cc.Model.new(model);
            }
            bibind(model, $(view));
            return model;
        },
        registerProcessor: function (typename, selector, processor) {
            registerProcessor(typename, selector, processor);
            return self;
        }
    }

});

cc.domBiBinder = cc.DomBiBinder.new();
