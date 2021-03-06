QUnit.test('DomBiBinder', function (assert) {
    var html = '' +
        '<div>' +
        '    <input cc-model="name" />' +
        '    <span cc-bind="name"></span>' +
        '</div>';
    var $el = $(html);
    $('#qunit-fixture').append($el);
    var NAME = 'abc', newNAME = 'ddd';
    var vm = cc.domBiBinder.bibind({
        name: NAME
    }, $el);
    assert.equal($el.find('input').val(), NAME, 'input = NAME');
    assert.equal($el.find('span').html(), NAME, 'span = NAME');
    $el.find('input').val(newNAME).trigger('change');
    assert.equal($el.find('input').val(), newNAME, 'input = newNAME');
    assert.equal($el.find('span').html(), newNAME, 'span = newNAME');
    vm.set('name', NAME);
    assert.equal($el.find('input').val(), NAME, 'input = NAME again');
    assert.equal($el.find('span').html(), NAME, 'span = NAME again');
    vm.set('name', false);
    assert.equal($el.find('input').val(), 'false', 'input = "false"');
    assert.equal($el.find('span').html(), 'false', 'span = "false"');
    vm.set('name', null);
    assert.equal($el.find('input').val(), '', 'input = ""');
    assert.equal($el.find('span').html(), '', 'span = ""');
});

QUnit.test('registerProcessor', function (assert) {
    var dbb = cc.DomBiBinder.new();
    dbb.registerProcessor('hello', '*', function (ctx, $el, attrValue) {
        $el.html('Hello ' + ctx.get(attrValue) + '!');
    });
    var html = '<div cc-hello="name"></div>';
    var $el = $(html);
    $('#qunit-fixture').append($el);
    var NAME = 'Han Meimei';
    dbb.bibind({ name: NAME}, $el);
    assert.equal($el.html(), 'Hello ' + NAME + '!', 'Hello, Han Meimei!');
});

QUnit.test('cc-bind with function', function (assert) {
    var html = '' +
        '<div>' +
        '   <input cc-model="name " />' +
        '   <span cc-bind="showName "></span>' +
        '</div>';
    var $el = $(html);
    $('#qunit-fixture').append($el);
    var NAME = 'abc', newNAME = 'ddd';
    var vm = cc.domBiBinder.bibind({
        name: NAME,
        showName: function (env) {
            return 'xxx' + env('name');
        }
    }, $el);
    assert.equal($el.find('span').html(), 'xxx' + NAME, 'span = xxxNAME');
    $el.find('input').val(newNAME).trigger('change');
    assert.equal($el.find('span').html(), 'xxx' + newNAME, 'span = xxxnewNAME');
    vm.set('name', NAME);
    assert.equal($el.find('span').html(), 'xxx' + NAME, 'span = xxxNAME again');
});

QUnit.test('vm auto converts array to collection', function (assert) {
    var html = '' +
        '<div>' +
        '    <script id="tpl" type="text/template"></script>' +
        '    <ul cc-datasource="a" cc-template="#tpl"></ul>' +
        '</div>';
    var vm = cc.domBiBinder.bibind({
        a: [1, 2, 3]
    }, html);
    assert.ok(cc.instanceOf(vm.get('a'), cc.Collection),
        'vm.get("a") is a collection');
});

QUnit.test('vm does not auto convert array to collection', function (assert) {
    var vm = cc.domBiBinder.bibind({
        a: [1, 2, 3]
    }, '<div></div>');
    assert.ok(!cc.instanceOf(vm.get('a'), cc.Collection),
        'vm.get("a") is not a collection');
});

QUnit.test('cc-datasource cc-template', function (assert) {
    var html = '' +
        '<div>' +
        '    <script id="tpl" type="text/template">' +
        '        <li><span cc-bind="showPrefix"></span><span cc-bind="value"></span></li>' +
        '    </script>' +
        '    <ul cc-datasource="languages" cc-template="#tpl"></ul>' +
        '</div>';
    var $el = $(html);
    $('#qunit-fixture').append($el);
    var vm = cc.domBiBinder.bibind({
        languages: [
            {
                value: 'C/C++',
                prefix: 'evil',
                showPrefix: function (env) {
                    var prefix = env('prefix');
                    if (prefix) {
                        return prefix + ' ';
                    } else {
                        return '';
                    }
                }
            },
            'Scheme',
            'JavaScript',
            'Ruby'
        ]
    }, $el);
    assert.equal($el.find('ul li').length, vm.get('languages').count(),
        'the number of lis === languages.length');
    var contentOfFirstLi = (function () {
        var $li = $el.find('ul li').eq(0);
        var prefix = $li.find('span[cc-bind="showPrefix"]').html();
        var lang = $li.find('span[cc-bind="value"]').html();
        return prefix + lang;
    })();
    assert.equal(contentOfFirstLi, 'evil C/C++',
        'the content of first li is "evil C/C++"');
    vm.get('languages').add('Python');
    assert.equal($el.find('ul li').length, vm.get('languages').count(),
        'the number of lis === languages.length after added');
    vm.get('languages').remove(function (m) {
        return m.value === 'Python';
    });
    assert.equal($el.find('ul li').length, vm.get('languages').count(),
        'the number of lis === languages.length after removed');
    vm.set('languages', ['Chinese', 'English']);
    assert.equal($el.find('ul li').length, 2,
        'the number of lis === 2 after set');
    assert.equal($el.find('ul li span[cc-bind="value"]').html(), 'Chinese',
        'the content of first li is "Chinese"');
    vm.get('languages').at(0).set('value', 'XXX');
    assert.equal($el.find('ul li span[cc-bind="value"]').html(), 'XXX',
        'the content of first li is "XXX"');
});

QUnit.test('cc-template shuffle', function (assert) {
    var html = '' +
        '<div>' +
            '<script id="tpl" type="text/template">' +
                '<li cc-bind="value"></li>' +
            '</script>' +
            '<ul cc-datasource="lst" cc-template="#tpl"></ul>' +
        '</div>';
    var $el = $(html);
    $('#qunit-fixture').append($el);
    var vm = cc.domBiBinder.bibind({
        lst: [3, 1, 2]
    }, $el);
    var getDomLst = function () {
        return Array.from($el.find('ul li')).map(function (e) {
            return Number.from($(e).html());
        });
    };
    assert.deepEqual(getDomLst(), [3, 1, 2], 'before sort');
    vm.get('lst').sort(function (a, b) {
        if (a.get('value') < b.get('value')) return -1;
        if (a.get('value') > b.get('value')) return 1;
        return 0;
    });
    assert.deepEqual(getDomLst(), [1, 2, 3], 'after sort');
});

QUnit.test('cc-attrs', function (assert) {
    var html = '' +
        '<div cc-attrs="a1: x; a2: f;">' +
        '</div>';
    var $el = $(html);
    $('#qunit-fixture').append($el);
    var vm = cc.domBiBinder.bibind({
        x: 'abc',
        f: function (env) {
            return 'f:' + env('x');
        }
    }, $el);
    assert.equal($el.attr('a1'), 'abc', '[a1="abc"]');
    assert.equal($el.attr('a2'), 'f:abc', '[a2="f:abc"]');
    vm.set('x', 'xxx');
    assert.equal($el.attr('a1'), 'xxx', '[a1="xxx"]');
    assert.equal($el.attr('a2'), 'f:xxx', '[a2="f:xxx"]');
});

QUnit.test('cc-style', function (assert) {
    var html = '' +
        '<div cc-style="style">' +
        '</div>';
    var $el = $(html);
    $('#qunit-fixture').append('<style>div{ padding: 12px; }</style>');
    $('#qunit-fixture').append($el);
    var vm = cc.domBiBinder.bibind({
        style: { padding : '1px' }
    }, $el);
    assert.equal($el.css('padding'), '1px', 'padding=1px');
    vm.set('style', { padding: '2px' });
    assert.equal($el.css('padding'), '2px', 'padding=2px');
    vm.set('style', cc.Model.new({ padding: '3px' }));
    assert.equal($el.css('padding'), '3px', 'padding=3px');
    vm.get('style').set('padding', '4px');
    assert.equal($el.css('padding'), '4px', 'padding=4px');
    vm.get('style').set('padding', undefined);
    assert.equal($el.css('padding'), '12px', 'padding=12px');
});

// TODO: test cc-events