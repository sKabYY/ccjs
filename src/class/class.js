var allocObject = function () {
    return {};
};

var BasicObject = cc.BasicObject = allocObject().extend({ classname: 'BasicObject' });

var Class = cc.Class = allocObject().extend({ classname: 'Class' });

var initClass = function (self, superclass, methodsOrInit) {
    var getMethods = (function () {
        if (cc.isFunction(methodsOrInit)) {
            return methodsOrInit;
        } else {
            return function () { return methodsOrInit; };
        }
    })();
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
    var alloc = function () {
        var obj = mkObj();
        obj.$meta$ = { class: self };
        var methods = getMethods(obj);
        if (methods) {
            obj.extend(methods);
        }
        return obj;
    };
    self.$meta$ = {
        class: Class,
        alloc: alloc,
        superclass: superclass
    };
    self.extend({
        new: function () {
            var obj = alloc();
            if (obj.hasOwnProperty('initialize') && cc.isFunction(obj.initialize)) {
                obj.initialize.apply(obj, arguments);
            }
            return obj;
        },
        extends: function (mthds) {
            var cls = allocObject();
            initClass(cls, self, mthds);
            return cls;
        }
    });
};

initClass(BasicObject, null, {
    initialize: Function.noop
});
initClass(Class, BasicObject, {
    initialize: Function.noop
});

Class.new = function (methods) {
    return BasicObject.extends(methods);
};
