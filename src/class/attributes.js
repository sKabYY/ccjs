cc.Attributes = cc.Mixin.new(function (self) {

    var attributes = {};

    var mkChangeEvents = (function () {
        var silenceEvents = {
            saveOldValue: Function.noop,
            saveAndTriggerChange: Function.noop,
            triggerChanges: Function.noop
        };
        var noSilenceEvents = (function () {
            var changes;
            var previous;
            return {
                saveOldValue: function (key) {
                    previous = attributes[key];
                },
                saveAndTriggerChange: function (key, value) {
                    changes[key] = value;
                    self.trigger('change:' + key, [previous, value]);
                },
                triggerChanges: function () {
                    self.trigger('changes', [changes]);
                },
                reset: function () {
                    changes = {};
                    return this;
                }
            };
        })();
        return function (silence) {
            return silence ? silenceEvents : noSilenceEvents.reset();
        };
    })();

    return {

        get: function (key) {
            return attributes[key];
        },

        set: function (k, v, options) {
            if (!cc.isString(k)) {
                options = v;
                v = undefined;
            }
            options = options || {};

            var changeEvents = mkChangeEvents(options.silence);

            (function (key, value) {
                changeEvents.saveOldValue(key);
                attributes[key] = value;
                changeEvents.saveAndTriggerChange(key, value);
            }.overloadSetter())(k, v);

            changeEvents.triggerChanges();
        },

        toJSON: function () {
            // TODO
        }

    };

}).Include(cc.Events);


cc.Model = cc.Class.new(function (self) {
    return {
        initialize: function (attrs) {
            self.set(attrs, { silence: true });
        }
    }
}).Include(cc.Attributes);
