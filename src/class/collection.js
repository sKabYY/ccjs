cc.Collection = cc.Class.new(function (self) {

    var array = [];

    return {

        initialize: function (arr) { },

        add: function (m) {
            if (!cc.instanceOf(m, cc.Model)) {
                m = cc.Model.new(m);
            }
            array.push(m);
            self.trigger('add', [m]);
            return self;
        },

        count: function () {
            return array.length;
        },

        at: function (i) {
            return array[i];
        },

        last: function () {
            return array[array.length - 1];
        },

        each: function (proc) {
            array.each(proc);
            return self;
        }

    };

}, 'Collection').Include(cc.Events);
