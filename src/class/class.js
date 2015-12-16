var allocObject = function () {
    return {};
};

var BasicObject = cc.BasicObject = allocObject().extend({ classname: 'BasicObject' });

var Class = cc.Class = allocObject().extend({ classname: 'Class' });

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

var initClass = function (self, superclass, methods) {
    self.super && self.super.initialize();
    var mkObj = (function () {
        if (superclass) {
            return function () {
                var constructor = function () {};
                var proto = constructor.prototype = superclass.$meta$.alloc();
                var obj = new constructor();
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
        Extends: function (mthds) {
            var cls = Class.$meta$.alloc();
            initClass(cls, self, mthds);
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
});

initClass(Class, BasicObject, null);

Class.implement(function (cls) {
    return {
        initialize: function (methods) {
            initClass(cls, BasicObject, methods);
        },
        Include: function (Mixin) {
            Mixin.mixin(cls);
            return cls;
        }
    };
});
