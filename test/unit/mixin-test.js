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
    assert.equal(cc.typeOf(MPosition), 'Mixin', 'typeOf MPosition is "Mixin"');
    assert.ok(cc.instanceOf(MPosition, cc.Mixin), 'MPosition is instanceOf cc.Mixin');
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

QUnit.test('self', function (assert) {
    var Ma = cc.Mixin.new(function (self) {
        return {
            setA: function (a) {
                self.a = a;
            },
            setAUsingThis: function (a) {
                this.a = a;
            }
        };
    });
    var Cls = cc.Class.new().Include(Ma);
    var obj = Cls.new();
    var A1 = 11, A2 = 22;
    obj.setA(A1);
    assert.equal(obj.a, A1, 'obj.a === A1');
    obj.setAUsingThis(A2);
    assert.equal(obj.a, A2, 'obj.a === A2');
});

QUnit.test('mixin include', function (assert) {
    var A1 = 'a1', A2 = 'a2', B = 'b';
    var Mab = cc.Mixin.new({
        a: function () { return A1; },
        b: function () { return B; }
    });
    var Ma = cc.Mixin.new({
        a: function () { return A2; }
    }).Include(Mab);
    var obj = cc.Class.new().Include(Ma).new();
    assert.equal(obj.a(), A2, 'obj.a() === A2');
    assert.equal(obj.b(), B, 'obj.b() === B');
});

QUnit.test('mixin include 2', function (assert) {
    var A1 = 'a1', A2 = 'a2', B = 'b';
    var Mab = cc.Mixin.new({
        a: A1,
        b: B
    });
    var Ma = cc.Mixin.new({
        a: A2
    }).Include(Mab);
    var obj = cc.Class.new().Include(Ma).new();
    assert.equal(obj.a, A2, 'obj.a === A2');
    assert.equal(obj.b, B, 'obj.b === B');
});

QUnit.test('mixin override', function (assert) {
    var cM = 'M', cC = 'C';
    var M = cc.Mixin.new({
        f: Function.returnValue(cM)
    });
    var obj = cc.Class.new({
        f: Function.returnValue(cC)
    }).Include(M).new();
    assert.equal(obj.f(), cC, 'obj.f() === cC');
});

QUnit.test('mixin override 2', function (assert) {
    var C1 = 1, C2 = 2;
    var M1 = cc.Mixin.new({ f: Function.returnValue(C1)});
    var M2 = cc.Mixin.new({ f: Function.returnValue(C2)});
    var obj = cc.Class.new().Include(M1).Include(M2).new();
    assert.equal(obj.f(), C1, 'obj.f() === C1');
});

QUnit.test('mixin and extend override', function (assert) {
    var cM = 'M', cC = 'C';
    var M = cc.Mixin.new({
        f: Function.returnValue(cM)
    });
    var obj = cc.Class.new({
        f: Function.returnValue(cC)
    }).Include(M).new();
    assert.equal(obj.f(), cC, 'obj.f() === cC');
    var obj2 = cc.Class.new({
        f: Function.returnValue(cC)
    }).Extends().Include(M).new();
    assert.equal(obj2.f(), cM, 'obj2.f() === cM');
});

QUnit.test('mixin closure', function (assert) {
    var MCounter = cc.Mixin.new(function () {
        var i = 0;
        return {
            spit: function () {
                ++i;
                return i;
            }
        };
    });
    var Counter = cc.Class.new().Include(MCounter);
    var c1 = Counter.new();
    var c2 = Counter.new();
    assert.equal(c1.spit(), 1, 'c1 spits 1');
    assert.equal(c2.spit(), 1, 'c2 spits 1');
    assert.equal(c1.spit(), 2, 'c1 spits 2');
    assert.equal(c2.spit(), 2, 'c2 spits 2');
});

QUnit.test('mixin initialize', function (assert) {
    var contents = [];
    var put = function (s) { contents.push(s); };
    var cM = 'M', cC = 'C';
    var M = cc.Mixin.new(function () {
        return {
            initialize: function () {
                put(cM);
                this.x = cM;
            }
        };
    });
    var C = cc.Class.new(function () {
        return {
            initialize: function () {
                put(cC);
                this.x = cC;
            }
        };
    }).Include(M);
    var obj = C.new();
    assert.equal(obj.x, cC, 'obj.x === cC');
    assert.equal(contents.length, 1, 'put once');
    assert.equal(contents[0], cC, 'contents has cC');
});

QUnit.test('mixin initialize 2', function (assert) {
    var contents = [];
    var put = function (s) { contents.push(s); };
    var cM = 'M';
    var M = cc.Mixin.new(function () {
        return {
            initialize: function () {
                put(cM);
                this.x = cM;
            }
        };
    });
    var C = cc.Class.new(function () {}).Include(M);
    var obj = C.new();
    assert.equal(obj.x, cM, 'obj.x === cM');
    assert.equal(contents.length, 1, 'put once');
    assert.equal(contents[0], cM, 'contents has cM');
});

QUnit.test('inherit with mixin', function (assert) {
    var M = cc.Mixin.new({ f: function () {
        return 'abc';
    }});
    var Sup = cc.Class.new().Include(M);
    var Sub = Sup.Extends();
    var sub = Sub.new();
    assert.ok(sub.f, 'sub has method f');
    assert.ok(sub.f(), 'abc', 'sub.f() === "abc"');
});

QUnit.test('inherit with mixin 2', function (assert) {
    var M0 = cc.Mixin.new({
        p: function () {
            return 'ppp';
        }
    });
    var M = cc.Mixin.new({
        f: function () {
            return 'abc';
        }
    }).Include(M0);
    var Sup = cc.Class.new().Include(M);
    var Sub = Sup.Extends();
    var sub = Sub.new();
    assert.ok(sub.f, 'sub has method f');
    assert.ok(sub.f(), 'abc', 'sub.f() === "abc"');
    assert.ok(sub.p, 'sub has method p');
    assert.ok(sub.p(), 'abc', 'sub.p() === "ppp"');
});
