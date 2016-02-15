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
        var name = attrValue.trim();
        var setVal = function () {
            var value = ctx.get(name);
            if (value === undefined) {
                value = '';
            }
            $el.val(value);
        };
        setVal();
        ctx.on('change:' + name, function (_, _, args) {
            if (!(cc.isObject(args) && cc.instanceOf(args.sender, $) && args.sender.is($el))) {
                setVal();
            }
        });
        $el.on('input change propertychange', function() {
            ctx.set(name, $el.val(), { extra: { sender: $el } });
        });
    });

    var _bibindName = function (ctx, name, updateView) {
        var update = function (env) {
            var value = ctx.get(name);
            if (cc.isFunction(value)) {
                value = value(env);
            }
            updateView(value);
        };
        var registerChangeEvent = function (key) {
            ctx.on('change:' + key, function () {
                update(ctx.get);
            });
        };
        update((function () {
            var dependencies = {};
            return function (key) {
                if (!dependencies[key]) {
                    registerChangeEvent(key);
                    dependencies[key] = true;
                }
                return ctx.get(key);
            };
        })());
        registerChangeEvent(name);
    };

    registerProcessor('bind', '*', function (ctx, $el, attrValue) {
        var toks = attrValue.split(':');
        var name = toks[0].trim();
        var typeName = toks[1];
        var type = typeName
            ? (function (tn){
                return cc[tn] || cc.global[tn]
            })(typeName.trim())
            : undefined;
        var valueToString = function (value) {
            if (cc.isNullOrUndefined(value)) {
                return '';
            } else if (typeName === undefined) {
                // do nothing
            } else if (cc.isFunction(type) || cc.instanceOf(type, cc.Class)) {
                value = type.new(value);
            } else {
                throw 'Unknown type: ' + type;
            }
            return value.toString();
        };
        _bibindName(ctx, name, function (value) {
            $el.html(valueToString(value));
        });
    });

    registerProcessor('attrs', '*', function (ctx, $el, attrValue) {
        attrValue.split(';').filter(Function.id).each(function (stm) {
            var toks = stm.split(':');
            var attrName = toks[0].trim(), name = toks[1].trim();
            _bibindName(ctx, name, function (value) {
                $el.attr(attrName, value);
            });
        });
    });

    registerProcessor('style', '*', function (ctx, $el, attrValue) {
        var name = attrValue;
        _bibindName(ctx, name, function (value) {
            if (cc.instanceOf(value, cc.Model)) {
                value.on('changes', function (changes) {
                    var style = {};
                    cc.each(changes, function (key, value) {
                        style[key] = value === undefined ? '' : value;
                    });
                    $el.css(style);
                });
                $el.css(value.toJSON());
            } else if (cc.isObject(value)) {
                $el.css(value);
            }
        });
    });

    registerProcessor('template', '*', function (ctx, $el, attrValue){
        var template = $(attrValue).html();
        var dsName = $el.attr(typeNameToAttr('datasource'));
        var setCollection = function () {
            var ds = ctx.get(dsName);
            var ATTR_MODEL_ID = 'cc-model-id';
            if (ds) {
                $el.empty();
                if (!cc.instanceOf(ds, cc.Collection)) {
                    ds = cc.Collection.new().addRange(ds);
                    ctx.set(dsName, ds, { silence: true });
                }
                var onAdded = function (m) {
                    var $dom = $(template);
                    bibind(m, $dom);
                    $dom.attr(ATTR_MODEL_ID, m.id());
                    $el.append($dom);
                };
                var render = function () {
                    $el.empty();
                    ds.each(function (m) {
                        onAdded(m);
                    });
                };
                render();
                ds.on('shuffle', function () {
                    render();
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
            return ds;
        };
        ctx.on('change:' + dsName, function () {
            var ds = setCollection();
            ctx.trigger('change-collection:' + dsName, [ds]);
        });
        setCollection();
    });

    registerProcessor('events', '*', function (ctx, $el, attrValue) {
        attrValue.split(';').each(function (evtRgt) {
            var toks = evtRgt.split('/');
            if (toks.length < 2 || toks.length > 3) {
                throw 'Invalid cc-events value: ' + attrValue;
            }
            var callbackName = toks.pop().trim();
            var evt = toks[0];
            var callback = function (e) {
                var f = ctx.get(callbackName);
                if (cc.instanceOf(f, Function)) {
                    return f.call(this, $(this), e, $el);
                } else {
                    throw callbackName + ' is not a function';
                }
            };
            if (toks.length === 1) {
                $el.on(evt, callback);
            } else if (toks.length === 2) {
                $el.on(evt, toks[1], callback);
            }
        });
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
