cc.Collection = cc.Class.new(function (self) {

    var array = [];

    return {

        initialize: function () { },

        add: function () {
            var ms = Array.from(arguments).map(function (m) {
                if (!cc.instanceOf(m, cc.Model)) {
                    m = cc.Model.new(m);
                }
                return m;
            });
            array.append(ms);
            self.trigger('add', [ms]);
        },

        addRange: function (ms) {
            self.add.apply(self, ms);
        },

        removeIf: function (predicate) {
            (function (pass, fail) {
                array = fail;
                self.trigger('remove', [pass]);
            }).apply(null, array.partition(predicate));
        },

        remove: function (id) {
            if (cc.instanceOf(id, cc.Model)) {
                id = id.id();
            }
            self.removeIf(function (m) {
                return m.id() === id;
            });
        },

        removeAt: function (i) {
            if (i < array.length) {
                var val = array[i];
                array.splice(i, 1);
                self.trigger('remove', [[val]]);
            }
        },

        empty: function () {
            var bak = array;
            array = [];
            self.trigger('remove', [bak]);
        },

        size: function () {
            return array.length;
        },

        count: function (predicate) {
            if (predicate) {
                return array.filter(predicate).length;
            } else {
                return array.length;
            }
        },

        at: function (i) {
            return array[i];
        },

        find: function (predicate) {
            return array.filter(predicate);
        },

        last: function () {
            return array[array.length - 1];
        },

        each: function (proc) {
            array.each(proc);
            return self;
        },

        toJSON: function () {
            return array.map(function (m) {
                return m.toJSON();
            });
        }

    };

}, 'Collection').Include(cc.Events);
