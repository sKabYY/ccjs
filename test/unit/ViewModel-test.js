QUnit.test('ViewModel', function (assert) {
    var html = '' +
        '<div>' +
            '<input cc-model="name" />' +
            '<span cc-bind="name"></span>' +
        '</div>';
    var $el = $(html);
    $('#qunit-fixture').append($el);
    var NAME = 'abc', newNAME = 'ddd';
    var vm = cc.ViewModel.new({
        name: 'abc'
    }).bibind($el);
    assert.equal($el.find('input').val(), NAME, 'input = NAME');
    assert.equal($el.find('span').html(), NAME, 'span = NAME');
    $el.find('input').val(newNAME).trigger('change');
    assert.equal($el.find('input').val(), newNAME, 'input = newNAME');
    assert.equal($el.find('span').html(), newNAME, 'span = newNAME');
    vm.set('name', NAME);
    assert.equal($el.find('input').val(), NAME, 'input = NAME again');
    assert.equal($el.find('span').html(), NAME, 'span = NAME again');
});
