var Element = function (tagName, props, children) {
    this.tagName = tagName
    this.props = props
    this.children = children
};

var REPLACE = 0
var INSERT = 1
var REMOVE = 2
var PROPS = 3
var TEXT = 4

var el = function (tagName, props, children) {
    return new Element(tagName, props, children);
};

var jdomToVdom = function ($dom) {
    if ($dom.length != 1) {
        throw 'need a single dom!';
    }
    var elem = $dom[0];
    return elemToVdom(elem);
};

var elemToVdom = function (elem) {
    if (elem.nodeType == 3) {
        // text node
        return elem.textContent;
    }
    var props = {};
    for (var i = 0; i < elem.attributes.length; ++i) {
        props[elem.attributes[i].name] = elem.attributes[i].value;
    }
    var childNodes = elem.childNodes;
    var children = childNodes.map(elemToVdom);  // TODO: bug! childNodes不是Array
    var vdom = el(elem.tagName, props, children);
    vdom.el = elem;
    return vdom;
}

var diff = function (vdom1, vdom2) {
    var patches = [];
    diffNode(vdom1, vdom2, patches);
    return patches;
};

var diffNode = function (node1, node2, patches) {
    if (node1 instanceof Element && node2 instanceof Element && node1.tagName == node2.tagName) {
        var props1 = node1.props;
        var props2 = node2.props;
        var newProps = {};
        var hasNewProps = false;
        for (var propName in props2) {
            if (!(propName in props1) || props1[propName] != props2[propName]) {
                newProps[propName] = props2[propName];
                hasNewProps = true;
            }
        }
        var removeProps = [];
        for (var propName in props1) {
            if (!(propName in props2)) {
                removeProps.push(propName);
            }
        }
        if (hasNewProps || removeProps.length > 1) {
            patches.push({
                type: PROPS,
                node: node1,
                props: newProps,
                removeProps: removeProps
            });
        }
        diffChildren(node1.children, node2.children, patches);
    } else {
        patches.push({
            type: REPLACE,
            from: node1,
            to: node2
        });
    }
};

var diffChildren = function (children1, children2, patches) {
    var size;
    if (children1.length < children2.length) {
        size = children1.length;
        patches.push({
            type: INSERT,
            nodes: children2.slice(size, children2.length)
        });
    } else if (children1.length > children2.length) {
        size = children2.length;
        patches.push({
            type: REMOVE,
            nodes: children1.slice(size, children1.length)
        });
    }
    for (var i = 0; i < size; ++i) {
        var node1 = children1[i];
        var node2 = children2[i];
        diffNode(node1, node2, patches);
    }
};

var apply = function (vdom, patches) {
};

