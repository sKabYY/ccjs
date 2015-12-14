QUnit.test('Class', function (assert) {
    var initX = 42;
    var newX = 22;
    var Test = cc.Class.new(function (self) {
        var x = initX;
        return {
            setX: function (v) { x = v; },
            getX: function () { return x; }
        };
    });
    var obj = Test.new();
    assert.equal(obj.getX(), initX,
        'obj.getX() === initX');
    obj.setX(newX);
    assert.equal(obj.getX(), newX,
        'obj.getX() === newX');
    assert.ok(cc.instanceOf(Test, cc.BasicObject),
        'Test is instanceof BasicObject');
    assert.ok(cc.instanceOf(obj, cc.BasicObject),
        'obj is instanceof BasicObject');
});

QUnit.test('instanceOf', function (assert) {
    var Test = cc.Class.new();
    var obj = Test.new();
    assert.ok(cc.instanceOf(obj, Test),
        'obj is instanceof Test');
    assert.ok(cc.instanceOf(obj, cc.BasicObject),
        'obj is instanceof BasicObject');
    assert.ok(cc.instanceOf(Test, cc.Class),
        'Test is instanceof Class');
    assert.ok(cc.instanceOf(Test, cc.BasicObject),
        'Test is instanceof BasicObject');
    assert.ok(cc.instanceOf(cc.Class, cc.BasicObject),
        'Class is instanceof BasicObject');
    assert.equal(Test.$meta$.class, cc.Class,
        'Test.$meta$.class === cc.Class');
});

QUnit.test('inherit', function (assert) {
    var X = 1, Y = 2, newX = 3;
    var Sup = cc.Class.new({
        x: X
    });
    var Sub = Sup.extends({
        y: Y
    });
    var sub = Sub.new();
    assert.equal(sub.x, X, 'sub.x === X');
    assert.equal(sub.y, Y, 'sub.y === Y');
    sub.super.x = newX;
    assert.equal(sub.x, newX, 'sub.x === newX');
});

QUnit.test('while new', function (assert) {
    var res = [];
    var put = function () { res.push(0); };
    var Sup = cc.Class.new(put);
    Sup.new();
    Sup.new();
    Sup.new();
    assert.equal(res.length, 3, 'res.length === 3');
    var Sub = Sup.extends(put);
    Sub.new();
    Sub.new();
    assert.equal(res.length, 7, 'res.length === 7');
});

QUnit.test('initialize', function (assert) {
    var res = [];
    var put = function () { res.push(0); };
    var Sup = cc.Class.new({
        initialize: put
    });
    Sup.new();
    Sup.new();
    Sup.new();
    assert.equal(res.length, 3, 'res.length === 3');
    var Sub = Sup.extends({
        initialize: put
    });
    Sub.new();
    Sub.new();
    assert.equal(res.length, 5, 'res.length === 5');
    var Sub2 = Sup.extends(function (self) {
        self.super.initialize();
        return {
            initialize: put
        };
    });
    Sub2.new();
    Sub2.new();
    assert.equal(res.length, 9, 'res.length === 9');
});

QUnit.test('initialize with params', function (assert) {
    var Point2D = cc.Class.new(function (self) {
        var _x, _y;
        return {
            initialize: function (x, y) {
                _x = x; _y = y;
            },
            x: function () { return _x; },
            y: function () { return _y; }
        }
    });
    var X = 2, Y = 3;
    var p1 = Point2D.new(X, Y);
    assert.equal(p1.x(), X, 'p1.x() === X');
    assert.equal(p1.y(), Y, 'p1.y() === Y');
});