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

    var arrayEach = cc.arrayEach = function (arr, proc) {
        for (var i = 0; i < arr.length; ++i) {
            proc(arr[i], i);
        }
    };

    Object.prototype.extend = function () {
        var that = this;
        arrayEach(arguments, function (obj) {
            each(obj, function (k, v) {
                that[k] = v;
            });
        });
        return that;
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

    var instanceOf = cc.instanceOf = function (inst, cls) {
        if (inst === null || inst === undefined) {
            return false;
        }
        if (cc.isFunction(cls)) {
            return inst instanceof cls;
        }
        var c = inst.class;
        while (c) {
            if (c === cls) {
                return true;
            }
            c = c.superclass;
        }
        return false;
    };

    Function.prototype.decorate = function (decrator) {
        return decrator(this);
    };

    var multipleSetterDecorator = function (setter) {
        return function (a, val) {
            var self = this;
            if (isString(a)) {
                setter.call(self, a, val);
            } else {
                each(a, function (k, v) {
                    setter.call(self, k, v);
                });
            }
        };
    };

    Function.prototype.overloadSetter = function () {
        return this.decorate(multipleSetterDecorator);
    };

    return cc;

})(cc);