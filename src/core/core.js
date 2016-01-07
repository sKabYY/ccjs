var cc = {};

(function () {
    if (typeof module !== 'undefined') {
        module.exports = cc;
    }
})();


(function (cc) {

    var each = cc.each = function (obj, proc) {
        for (var k in obj) {
            if (proc.call(obj[k], k, obj[k]) === false) {
                break;
            }
        }
    };

    var arrayEach = cc.arrayEach = function (arr, proc) {
        for (var i = 0; i < arr.length; ++i) {
            if (proc.call(arr[i], arr[i], i) === false) {
                break;
            }
        }
    };

    var jsTypeOf = function (obj) {
        var typeStr = Object.prototype.toString.call(obj);
        return /\[object (.*)]/.exec(typeStr)[1].toLowerCase();
    };

    arrayEach([
        'Object',
        'String',
        'Function',
        'Array',
        'Number'
    ], function (typeName) {
        cc['is' + typeName] = function (obj) {
            return jsTypeOf(obj) === typeName.toLowerCase();
        };
    });

    var isNullOrUndefined = cc.isNullOrUndefined = function (v) {
        return v === null || v === undefined;
    };

    cc.typeOf = function (obj) {
        if (obj &&
            obj.$meta$ &&
            obj.$meta$.class &&
            cc.isFunction(obj.$meta$.class.name)) {
            return obj.$meta$.class.name();
        } else {
            return jsTypeOf(obj);
        }
    };

    cc.instanceOf = function (inst, cls) {
        if (isNullOrUndefined(inst)) {
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
            if (cc.isString(a)) {
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
        },

        returnTrue: function () {
            return true;
        },

        returnFalse: function () {
            return false;
        }

    });


    Object.extend({

        clone: function (obj) {
            var cln = {};
            cc.each(obj, function (k, v) {
                cln[k] = v;
            });
            return cln;
        }

    });


    Array.implement({
        each: function (proc) {
            arrayEach(this, proc);
            return this;
        },
        partition: function (predicate) {
            var pass = [], fail = [];
            this.each(function (v) {
                (predicate(v) ? pass : fail).push(v);
            });
            return [pass, fail];
        },
        append: function (array) {
            this.push.apply(this, array);
            return this;
        }
    });


    Array.extend({
        from: function (v) {
            var l = v.length;
            if (!cc.isNumber(l)) {
                return [v];
            }
            var ret = [];
            for (var i = 0; i < l; ++i) {
                ret.push(v[i]);
            }
            return ret;
        }
    });


    String.implement({
        startsWith: function (prefix) {
            return this.indexOf(prefix) === 0;
        },
        format: function (ctx) {
            var s = this;
            cc.each(ctx, function (k, v) {
                var reg = new RegExp('{' + k + '}', 'g');
                s = s.replace(reg, v);
            });
            return s;
        }
    });


    return cc;

})(cc);