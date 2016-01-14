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
        '   <input cc-model="name" />' +
        '   <span cc-bind="showName"></span>' +
        '</div>';
    var $el = $(html);
    $('#qunit-fixture').append($el);
    var NAME = 'abc', newNAME = 'ddd';
    var vm = cc.domBiBinder.bibind({
        name: NAME,
        showName: function (scope) {
            return 'xxx' + scope('name');
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
                showPrefix: function (scope) {
                    var prefix = scope('prefix');
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

// TODO: test cc-events