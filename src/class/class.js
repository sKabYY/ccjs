
var Class = cc.Class = {
    classname: 'Class'
};

var BasicObject = cc.BasicObject = {
    classname: 'BasicObject'
};

var initClass = function (self, methods, superclass) {
    self.extend({
        new: function () {
            var obj = superclass ? superclass.new() : {};
            obj.class = self;
            if (cc.isFunction(methods)) {
                methods = methods(obj);
            }
            if (methods) {
                obj.extend(methods);
            }
            return obj;
        },
        extends: function (mthds) {
            var cls = {};
            initClass(cls, mthds, self);
            return cls;
        },
        class: Class,
        superclass: superclass
    });
};

initClass(BasicObject, null, null);
initClass(Class, null, BasicObject);
