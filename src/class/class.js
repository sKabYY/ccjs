
var BasicObject = cc.BasicObject = {};

var Class = cc.Class = (function () {
    var self = {};
    self.extend({
        extends: function (methods) {
            return {
                new: function () {
                    var obj = { class: this };
                    if (cc.isFunction(methods)) {
                        methods = methods(obj);
                    }
                    if (methods) {
                        obj.extend(methods);
                    }
                    return obj;
                },
                class: self,
                superclass: self
            };
        },
        classname: 'Class',
        class: self,
        superclass: BasicObject
    });
    return self;
})();

BasicObject.extend({
    class: Class,
    classname: 'BasicObject',
    superclass: null
});
