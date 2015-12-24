var cc = require('../dist/cc.core.js');

var getTick = function () {
    return new Date().getTime();
};

var WatchModel = cc.Model.Extends(function (self) {
    var running = false;
    self.set('time', 0.0);
    var last = getTick();
    (function loop() {
        if (running) {
            var now = getTick();
            var time = self.get('time') + (now - last)/1000.0;
            self.set('time', time);
            last = now;
        }
        setTimeout(function () {
            loop();
        }, 10);
    })();
    return {
        toggle: function () {
            last = getTick();
            running = !running;
        }
    };
});

var WatchView = cc.Class.new(function () {
    var update = function (time) {
        process.stdout.write('\r' + time.toFixed(2));
    };
    return {
        initialize: function (model) {
            update(model.get('time'));
            model.on('change:time', function (_, time) {
                update(time);
            });
        }
    };
});

var WatchController = cc.Class.new(function () {
    var model = WatchModel.new();
    WatchView.new(model);
    var stdin = process.openStdin();
    stdin.resume();
    stdin.setEncoding( 'utf8' );
    stdin.on('data', function (key) {
        if (key === '\u0003' || key === 'q') {
            process.exit();
        } else if (key === '\r') {
            model.toggle();
        }
    });
});

require('tty').setRawMode(true);
WatchController.new();
