(function () {
    this.invoke = function (f, args) {
        return f.apply(null, args);
    };
}).call((function () {
    return this;
})());