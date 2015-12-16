QUnit.test('mixin', function (assert) {
    var MPosition = cc.Mixin.new(function () {
        var _x, _y;
        return {
            setX: function (x) { _x = x; },
            setY: function (y) { _y = y; },
            getX: function () { return _x; },
            getY: function () { return _y; }
        };
    });
    var X = 11, Y = 22, newX = 33, newY = 44;
    var Test = cc.Class.new(function (self) {
        return {
            initialize: function (x, y) {
                self.setX(x);
                self.setY(y);
            }
        };
    }).Include(MPosition);
    var obj = Test.new(X, Y);
    assert.equal(obj.getX(), X, 'obj.getX() === X');
    assert.equal(obj.getY(), Y, 'obj.getY() === Y');
    obj.setX(newX);
    obj.setY(newY);
    assert.equal(obj.getX(), newX, 'obj.getX() === newX');
    assert.equal(obj.getY(), newY, 'obj.getY() === newY');
});