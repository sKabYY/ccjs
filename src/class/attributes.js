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
                saveAndTriggerChange: function (key, value, extra) {
                    if (previous !== value) {
                        changes[key] = value;
                        self.trigger('change:' + key, [previous, value, extra]);
                    }
                },
                triggerChanges: function (extra) {
                    if (Object.keys(changes).length > 0) {
                        self.trigger('changes', [changes, extra]);
                    }
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
            var extra = options['extra'];

            var changeEvents = mkChangeEvents(options.silence);

            (function (key, value) {
                changeEvents.saveOldValue(key);
                attributes[key] = value;
                changeEvents.saveAndTriggerChange(key, value, extra);
            }.overloadSetter())(k, v);

            changeEvents.triggerChanges(extra);
        },

        toJSON: function () {
            return Object.clone(attributes);
        }

    };

}).Include(cc.Events);


cc.Model = cc.Class.new(function (self) {
    return {
        initialize: function (attrs) {
            self.set(attrs, { silence: true });
        }
    };
}, 'Model').Include(cc.Attributes);
