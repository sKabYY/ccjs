var wrapAndSet = function (obj, values) {
    if (cc.isFunction(values)) {
        values = values.call(obj, obj);
    }
    (function (name, value) {
        if (cc.isFunction(value)) {
            obj[name] = value.bind(obj);
        } else {
            obj[name] = value;
        }
    }.overloadPluralSetter())(values);
};

var allocObject = function () {
    var self = {};
    self.extend = cc.setter(self).overloadSetter();
    return self;
};

var BasicObject = cc.BasicObject = allocObject();

var Class = cc.Class = allocObject();

var initClass = function (self, superclass, methods, classname) {
    self.super && self.super.initialize();
    var mkObj = (function () {
        if (superclass) {
            return function () {
                var ccObject = function () {};
                var proto = ccObject.prototype = superclass.$meta$.alloc();
                var obj = new ccObject();
                obj.super =  proto;
                return obj;
            };
        } else {
            return allocObject;
        }
    })();
    self.$meta$ = {
        class: Class,
        alloc: function () {
            var obj = mkObj();
            obj.$meta$ = { class: self };
            wrapAndSet(obj, methods);
            return obj;
        },
        superclass: superclass
    };
    self.extend({
        new: function () {
            var obj = self.$meta$.alloc();
            if (obj.hasOwnProperty('initialize') && cc.isFunction(obj.initialize)) {
                obj.initialize.apply(obj, arguments);
            }
            return obj;
        },
        name: Function.returnValue(classname || 'ccObject'),
        Extends: function (mthds, name) {
            var cls = Class.$meta$.alloc();
            initClass(cls, self, mthds, name);
            return cls;
        },
        implement: function (mthds) {
            var oldAlloc = self.$meta$.alloc;
            self.$meta$.alloc = function () {
                var obj = oldAlloc();
                wrapAndSet(obj, mthds);
                return obj;
            };
            return self;
        }
    });
};

initClass(BasicObject, null, {
    initialize: Function.noop
}, 'BasicObject');

initClass(Class, BasicObject, null, 'Class');

Class.implement(function (cls) {
    return {
        initialize: function (methods, classname) {
            initClass(cls, BasicObject, methods, classname);
        },
        Include: function (Mixin) {
            Mixin.mixin(cls);
            return cls;
        }
    };
});
