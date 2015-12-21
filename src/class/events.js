cc.Events = cc.Mixin.new(function (self) {

    var registry;

    var reset = function () {
        registry = {};
    };

    var DELIM = '.';

    var splitType = function (type, returns) {
        var delimIdx = type.indexOf(DELIM);
        var name = delimIdx < 0 ? type : type.substring(0, delimIdx);
        return returns(name, type);
    };

    var hasExtraNamespace = function (name, namespace) {
        return name !== namespace;
    };

    var mkMatch = function (namespace) {
        if (namespace) {
            return function (str) {
                var idx = namespace.indexOf(str);
                if (idx === 0) {
                    var c = namespace[str.length];
                    return !c || c === DELIM;
                } else {
                    return false;
                }
            };
        } else {
            return Function.returnTrue;
        }
    };

    var match = function (matcher, str) {
        return matcher(str);
    };

    reset();

    return {

        on: function (type, method) {
            splitType(type, function (name, namespace) {
                var handler = {
                    method: method,
                    nsmatcher: mkMatch(namespace)
                };
                if (registry.hasOwnProperty(name)) {
                    registry[name].push(handler);
                } else {
                    registry[name] = [handler];
                }
            });
            return self;
        },

        off: function (type) {
            if (type) {
                splitType(type, function (name, namespace) {
                    if (registry.hasOwnProperty(name)) {
                        if (hasExtraNamespace(name, namespace)) {
                            registry[name] = registry[name].filter(function (handler) {
                                return !match(handler.nsmatcher, namespace);
                            });
                            if (registry[name] === []) delete registry[name];
                        } else {
                            delete registry[name];
                        }
                    }
                });
            } else {
                reset();
            }
            return self;
        },

        trigger: function (type, args) {
            splitType(type, function (name, namespace) {
                if (registry.hasOwnProperty(name)) {
                    registry[name].each(function (handler) {
                        if (match(handler.nsmatcher, namespace)) {
                            handler.method.apply(self, args);
                        }
                    });
                }
            });
            return self;
        }

    };

});


cc.Dispatcher = cc.Class.new().Include(cc.Events);
