cc.Collection = cc.Class.new(function (self) {

    var array = [];
    var ElemClass;

    return {

        initialize: function (klass) {
            if (cc.isNullOrUndefined(klass)) {
                ElemClass = cc.Model;
            } else if (cc.extendsOf(klass, cc.Model)) {
                ElemClass = klass;
            } else {
                throw 'Need cc.Model but get ' + klass.toString();
            }
        },

        add: function () {
            var ms = Array.from(arguments).map(function (m) {
                if (!cc.instanceOf(m, ElemClass)) {
                    m = ElemClass.new(m);
                }
                return m;
            });
            array.append(ms);
            self.trigger('add', [ms]);
            return self;
        },

        addRange: function (ms) {
            self.add.apply(self, ms);
            return self;
        },

        removeIf: function (predicate) {
            (function (pass, fail) {
                array = fail;
                self.trigger('remove', [pass]);
            }).apply(null, array.partition(predicate));
        },

        remove: function (id) {
            if (cc.instanceOf(id, ElemClass)) {
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

        sort: function (compareFunction) {
            array.sort(compareFunction);
            self.trigger('shuffle', []);
            return self;
        },

        toJSON: function () {
            return array.map(function (m) {
                return m.toJSON();
            });
        }

    };

}, 'Collection').Include(cc.Events);
