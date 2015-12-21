cc.Eventuality = cc.Mixin.new(function (self) {

    var registry;

    var reset = function () {
        registry = {};
    };

    var splitType = function (type) {
        var delim = '.';
        var delimIdx = type.indexOf(delim);
        if (delimIdx < 0) {
            return {
                name: type,
                namespace: ''
            };
        }
        var name = type.substring(0, delimIdx);
        var namespace = type.substring(delimIdx + 1);
        return {
            name: name,
            namespace: namespace
        };
    };

    var mkMatch = function (namespace) {
        if (namespace) {
            return function (str) {
                return !str || str === namespace || namespace.startsWith(str + '.');
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
            var ts = splitType(type);
            var name = ts.name;
            var handler = {
                method: method,
                nsmatcher: mkMatch(ts.namespace)
            };
            if (registry.hasOwnProperty(name)) {
                registry[name].push(handler);
            } else {
                registry[name] = [handler];
            }
        },

        off: function (type) {
            // TODO
        },

        trigger: function (type, args) {
            var ts = splitType(type);
            var name = ts.name;
            var namespace = ts.namespace;
            if (registry.hasOwnProperty(name)) {
                registry[name].each(function (handler) {
                    if (match(handler.nsmatcher, namespace)) {
                        handler.method.apply(self, args);
                    }
                });
            }
        }

    };

});


cc.Events = cc.Class.new().Include(cc.Eventuality);
