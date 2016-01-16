var cc = {};

(function () {
    if (typeof module !== 'undefined') {
        module.exports = cc;
    }
})();


(function (cc) {

    cc.global = (function () { return this; })();

    var each = cc.each = function (obj, proc) {
        for (var k in obj) {
            if (proc.call(null, k, obj[k]) === false) {
                break;
            }
        }
    };

    var arrayEach = cc.arrayEach = function (arr, proc) {
        for (var i = 0; i < arr.length; ++i) {
            if (proc.call(null, arr[i], i) === false) {
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
        'Number',
        'Date'
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
            return inst.constructor === cls || inst instanceof cls;
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

    Function.prototype.implementWithoutOverride = function (k, v) {
        if (!(k in this.prototype)) {
            this.prototype[k] = v;
        }
    }.overloadSetter();

    Function.implement({

        extend: function (k, v) {
            this[k] = v;
        }.overloadSetter(),

        new: function () {
            var args = Array.from(arguments);
            args.unshift(null);
            return new (this.bind.apply(this, args))();
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
        },

        compare: function (a, b) {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        },

        id: function (x) { return x; }

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


    Number.extend({
        from: function (v) {
            return parseFloat(v);
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

    var dateFormat = function(format) {
        if (isNaN(this.getDay())) { //Invalid Date
            return "";
        }
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours() % 12, //hour
            "H+": this.getHours(), //hour
            "AP": this.getHours() > 12 ? 'PM' : 'AM', //AM/PM
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };
    // var _dateToString = Date.prototype.toString;
    Date.implement({
        toString: function (format) {
            if (!format) {
                format = 'yyyy-MM-dd HH:mm:ss';
            }
            return dateFormat.call(new Date(this), format);
        }
    });


    return cc;

})(cc);