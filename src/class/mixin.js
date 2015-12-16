
cc.Mixin = cc.Class.new(function (self) {
    var methods;
    return {
        initialize: function (mthds) {
            self.super.initialize();
            methods = mthds;
        },
        mixin: function (cls) {
            cls.implement(methods);
            return self;
        }
    };
});