var cc = {};
(function (cc) {

    var each = cc.each = function (obj, proc) {
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                if (proc(k, obj[k]) === false) {
                    break;
                }
            }
        }
    };

    cc.arrayEach = function (arr, proc) {
        for (var i = 0; i < arr.length; ++i) {
            proc(arr[i], i);
        }
    };

    cc.setter = function (obj) {
        return function (a, b) {
            obj[a] = b;
            return obj;
        };
    };

    var typeOf = cc.typeOf = function (obj) {
        // TODO
        return typeof obj;
    };
    var isString = cc.isString = function (obj) {
        return typeOf(obj) === 'string';
    };
    var isFunction = cc.isFunction = function (obj) {
        return typeOf(obj) === 'function';
    };

    var isNumber = cc.isNumber = function (obj) {
        return typeOf(obj) === 'number';
    };

    var instanceOf = cc.instanceOf = function (inst, cls) {
        if (inst === null || inst === undefined) {
            return false;
        }
        if (cc.isFunction(cls)) {
            return inst instanceof cls;
        }
        var c = inst.$meta$ && inst.$meta$.class;
        while (c) {
            if (c === cls) {
                return true;
            }
            c = c.$meta$.superclass;
        }
        return false;
    };


    var pluralSetterDecorator = function (setter) {
        return function (a) {
            var self = this;
            each(a, function (k, v) {
                setter.call(self, k, v);
            });
            return self;
        };
    };

    var multipleSetterDecorator = function (setter) {
        var pluralSet = setter.overloadPluralSetter();
        return function (a, val) {
            var self = this;
            if (isString(a)) {
                setter.call(self, a, val);
            } else {
                pluralSet.call(self, a);
            }
            return self;
        };
    };


    Function.prototype.decorate = function (decrator) {
        return decrator(this);
    };

    Function.prototype.overloadPluralSetter = function () {
        return this.decorate(pluralSetterDecorator);
    };

    Function.prototype.overloadSetter = function () {
        return this.decorate(multipleSetterDecorator);
    };

    Function.prototype.implement = function (k, v) {
        this.prototype[k] = v;
    }.overloadSetter();

    Function.implement({

        extend: function (k, v) {
            this[k] = v;
        }.overloadSetter(),

        bind: function (obj) {
            var func = this;
            var args = Array.from(arguments).slice(1);
            return function () {
                return func.apply(obj,
                    Array.from(
                        args.concat(
                        Array.from(arguments))));
            };
        }
    });


    Function.extend({

        noop: function () {},

        returnValue: function (value) {
            return function () {
                return value;
            };
        }

    });

    Array.extend({
        from: function (v) {
            var l = v.length;
            if (!isNumber(l)) {
                return [v];
            }
            var ret = [];
            for (var i = 0; i < l; ++i) {
                ret.push(v[i]);
            }
            return ret;
        }
    });

    return cc;

})(cc);