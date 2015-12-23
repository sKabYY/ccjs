QUnit.test('Class', function (assert) {
    var initX = 42;
    var newX = 22;
    var Test = cc.Class.new(function () {
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

QUnit.test('extend', function (assert) {
    var Cls = cc.Class.new();
    var obj = Cls.new();
    var X = 11, Y = 22;
    invoke(obj.extend, [{
        x: X,
        y: Y
    }]);
    assert.equal(obj.x, X, 'obj.x === X');
    assert.equal(obj.y, Y, 'obj.y === Y');
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
    var Sub = Sup.Extends({
        y: Y
    });
    var sub = Sub.new();
    assert.equal(sub.x, X, 'sub.x === X');
    assert.equal(sub.y, Y, 'sub.y === Y');
    sub.super.x = newX;
    assert.equal(sub.x, newX, 'sub.x === newX');
});

QUnit.test('override', function (assert) {
    var say = function (s) { say.content = s };
    var Sup = cc.Class.new({
        say: function () { say('Sup'); }
    });
    var Sub = Sup.Extends({
        say: function () { say('Sub'); }
    });
    var sup = Sup.new();
    var sub = Sub.new();
    sup.say();
    assert.equal(say.content, 'Sup', 'say Sup');
    sub.say();
    assert.equal(say.content, 'Sub', 'say Sub');
    sub.super.say();
    assert.equal(say.content, 'Sup', 'say Sup');
});

QUnit.test('while new', function (assert) {
    var res = [];
    var put = function () { res.push(0); };
    var Sup = cc.Class.new(put);
    Sup.new();
    Sup.new();
    Sup.new();
    assert.equal(res.length, 3, 'res.length === 3');
    var Sub = Sup.Extends(put);
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
    var Sub = Sup.Extends({
        initialize: put
    });
    Sub.new();
    Sub.new();
    assert.equal(res.length, 5, 'res.length === 5');
    var Sub2 = Sup.Extends(function (self) {
        self.super.initialize();
        return {
            initialize: put
        };
    });
    Sub2.new();
    Sub2.new();
    assert.equal(res.length, 9, 'res.length === 9');
});

QUnit.test('initialize inherit', function (assert) {
    var res = [];
    var put = function () { res.push(0); };
    var C1 = cc.Class.new({
        initialize: put
    });
    var C2 = C1.Extends();
    var C3 = C2.Extends({
        initialize: function () {
            this.super.initialize();
            put();
        }
    });
    C3.new();
    assert.equal(res.length, 2, 'res.length === 2');
});

QUnit.test('initialize with params', function (assert) {
    var Point2D = cc.Class.new(function () {
        var _x, _y;
        return {
            initialize: function (x, y) {
                _x = x; _y = y;
            },
            x: function () { return _x; },
            y: function () { return _y; }
        };
    });
    var X = 2, Y = 3;
    var p1 = Point2D.new(X, Y);
    assert.equal(p1.x(), X, 'p1.x() === X');
    assert.equal(p1.y(), Y, 'p1.y() === Y');
});

QUnit.test('test this', function (assert) {
    var A = 333;
    var Test = cc.Class.new(function () {
        this.a = A;
        return {
            initialize: function (q) {
                this.q = q;
            },
            setp: function (p) {
                this.p = p;
            }
        };
    });
    var Q = 21, P = 12;
    var obj = Test.new(Q);
    obj.setp(P);
    assert.equal(obj.a, A, 'obj.a === A');
    assert.equal(obj.p, P, 'obj.p === P');
    assert.equal(obj.q, Q, 'obj.q === Q');
});

QUnit.test('no this', function (assert) {
    var Point2D = cc.Class.new(function () {
        var _x, _y;
        return {
            initialize: function (x, y) {
                _x = x;
                _y = y;
            },
            x: function () { return _x; },
            y: function () { return _y; },
            setX: function (x) { _x = x; },
            setY: function (y) { _y = y; }
        };
    });
    var X = 11, Y = 22, newX = 88, newY = 99;
    var mkPoint2D = Point2D.new;
    var p = mkPoint2D(X, Y);
    var px = p.x;
    var pSetX = p.setX;
    assert.equal(px(), X, 'px() === X');
    assert.equal(invoke(p.y), Y, 'invoke(p.x) === Y');
    pSetX(newX);
    invoke(p.setY, [newY]);
    assert.equal(invoke(p.x), newX, 'invoke(p.x) === newX');
    assert.equal(invoke(p.y), newY, 'invoke(p.x) === newY');
});

QUnit.test('fuck this', function (assert) {
    var newClass = cc.Class.new;
    var A = 333;
    var Test = newClass(function () {
        this.a = A;
        return {
            initialize: function (q) {
                this.q = q;
            },
            setp: function (p) {
                this.p = p;
            }
        };
    });
    var Q = 21, P = 12;
    var obj = invoke(Test.new, [Q]);
    obj.setp(P);
    assert.equal(obj.a, A, 'obj.a === A');
    assert.equal(obj.p, P, 'obj.p === P');
    assert.equal(obj.q, Q, 'obj.q === Q');
});

QUnit.test('Class implement include', function (assert) {
    var Sup = cc.Class.new();
    assert.notEqual(Sup.Include, undefined, 'Sup.include != undefined');
    var Sub = Sup.Extends();
    assert.notEqual(Sub.Include, undefined, 'Sub.include != undefined');
});

QUnit.test('implement', function (assert) {
    var A = 111;
    var Cls = cc.Class.new().implement(function (self) {
        return {
            a: 111,
            f: function () { return self.a; }
        };
    });
    var obj = Cls.new();
    assert.equal(obj.a, A, 'obj.a === A');
    assert.equal(obj.f(), A, 'obj.f() === A');
});

QUnit.test('chain', function (assert) {
    var Cls = cc.Class.new(function (self) {
        return {
            set: function (k, v) {
                self[k] = v;
            }.overloadSetter()
        };
    });
    var obj = Cls.new();
    obj.set('a', 1).set({
        b: 2,
        c: 3
    }).set('b', 4);
    assert.equal(obj.a, 1, 'obj.a === 1');
    assert.equal(obj.b, 4, 'obj.b === 4');
    assert.equal(obj.c, 3, 'obj.c === 3');
});

QUnit.test('wrapper', function (assert) {
    var Test = cc.Class.new({
        initialize: function (x, y) {
            this.x = x;
            this.y = y;
        },
        set: function (k, v) {
            this[k] = v
        }.overloadSetter()
    });
    var X = 1, Y = 2, newX = 11, newY = 22;
    var obj = invoke(Test.new, [X, Y]);
    assert.equal(obj.x, X, 'obj.x === X');
    assert.equal(obj.y, Y, 'obj.y === Y');
    invoke(obj.set, ['x', newX]);
    invoke(obj.set, [{ y: newY }]);
    assert.equal(obj.x, newX, 'obj.x === newX');
    assert.equal(obj.y, newY, 'obj.y === newY');
});

QUnit.test('more typeOf', function (assert) {
    var Cls = cc.Class.new();
    var obj = Cls.new();
    assert.equal(cc.typeOf(cc.Class), 'Class', 'cc.Class is Class');
    assert.equal(cc.typeOf(Cls), 'Class', 'Cls is Class');
    assert.equal(cc.typeOf(obj), 'ccObject', 'obj is ccObject');

    obj = cc.BasicObject.new();
    assert.equal(cc.typeOf(cc.BasicObject), 'Class',
        'cc.BasicObject is Class');
    assert.equal(cc.typeOf(obj), 'BasicObject',
        'obj is BasicObject');

    var BCls = cc.BasicObject.Extends();
    assert.equal(cc.typeOf(BCls), 'Class', 'Cls is Class');
    obj = BCls.new();
    assert.equal(cc.typeOf(obj), 'ccObject', 'obj is ccObject');

    var Test = cc.Class.new(null, 'Test');
    var Sub1 = Test.Extends();
    var Sub2 = Test.Extends(null, 'Sub2');
    assert.equal(cc.typeOf(Test.new()), 'Test', 'Test.new() is Test');
    assert.equal(cc.typeOf(Sub1.new()), 'ccObject', 'Sub1.new() is ccObject');
    assert.equal(cc.typeOf(Sub2.new()), 'Sub2', 'Sub2.new() is Sub2');
});