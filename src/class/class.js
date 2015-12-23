var setff = function (obj, values, transform, predict) {
    if (cc.isFunction(values)) {
        values = values.call(obj, obj);
    }
    (function (name, value) {
        if (predict(name, value)) {
            obj[name] = transform(name, value);
        }
    }.overloadPluralSetter())(values);
};

var wrapAndSetWithPredict = function (obj, values, predict) {
    setff(obj, values, function (name, value) {
        if (cc.isFunction(value)) {
            return value.bind(obj);
        } else {
            return value;
        }
    }, predict);
};

var wrapAndSet = function (obj, values) {
    wrapAndSetWithPredict(obj, values, Function.returnTrue);
};

var wrapAndSetWithoutOverride = function (obj, values) {
    wrapAndSetWithPredict(obj, values, function (name) {
        return !obj.hasOwnProperty(name);
    });
};

var allocObject = function () {
    var self = {};
    self.extend = function (k, v) {
        self[k] = v;
    }.overloadSetter();
    return self;
};

var BasicObject = cc.BasicObject = allocObject();

var Class = cc.Class = allocObject();

var initClass = function (self, superclass, methods, classname) {
    self.super && self.super.initialize();
    var mkObj = (function () {
        if (superclass) {
            return function () {
                var proto = superclass.$meta$.alloc();
                var obj = Object.create(proto);
                obj.super = proto;
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
    var implementf = function (mthds, setMethods) {
        var allocOld = self.$meta$.alloc;
        self.$meta$.alloc = function () {
            var obj = allocOld();
            setMethods(obj, mthds);
            return obj;
        };
        return self;
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
            return implementf(mthds, wrapAndSet);
        },
        implementWithoutOverride: function (mthds) {
            return implementf(mthds, wrapAndSetWithoutOverride);
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
