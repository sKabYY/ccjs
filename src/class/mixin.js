cc.Mixin = cc.Class.new(function (self) {
    var doMixin;
    return {
        initialize: function (methods) {
            self.super.initialize();
            doMixin = function (cls) {
                cls.implementWithoutOverride(methods);
            };
        },
        mixin: function (cls) {
            doMixin(cls);
            return self;
        },
        Include: function (Mxn) {
            var doMixinOld = doMixin;
            doMixin = function (cls) {
                doMixinOld(cls);
                Mxn.mixin(cls);
            };
            return self;
        }
    };
}, 'Mixin');
