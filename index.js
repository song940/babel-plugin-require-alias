
function requireAlias(aliases) {
  function replaceWithAlias(name) {
    Object.keys(aliases).forEach(key => {
      if (name === key || name.indexOf(`${key}/`) === 0) {
        const to = aliases[key];
        if (typeof to === 'string') {
          name = name.replace(key, to);
        }
        if (typeof to === 'function') {
          name = to(name);
        }
      }
    });
    return name;
  }
  return () => {
    return {
      visitor: {
        CallExpression: function CallExpression(path) {
          // require
          const { node } = path;
          if (node.callee.name === 'require' && node.arguments.length === 1) {
            const filepath = node.arguments[0].value;
            if (!filepath) return;
            node.arguments[0].value = replaceWithAlias(filepath);
            return;
          }
          // require.resolve
          const { callee } = node;
          if (!callee.object) return;
          if (!callee.property) return;
          if (node.arguments.length !== 1) return;
          if (!node.arguments[0].value) return;
          if (callee.object.name === 'require' && callee.property.name === 'resolve') {
            node.arguments[0].value = replaceWithAlias(node.arguments[0].value);
          }
        }
      }
    };
  };
}

module.exports = requireAlias;
