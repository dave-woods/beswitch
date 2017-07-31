const beswitchPlugin = function (babel) {
  const { types: t } = babel

  const pluginNamespace = typeof window !== 'undefined' ? 'window' : 'global'
  const pluginName = 'beswitch'
  const pluginObj = `${pluginName}Obj`
  const pluginVal = `${pluginName}Val`

  const header = babel.transform(`if (typeof ${pluginNamespace}.${pluginName} !== 'function') {
  ${pluginNamespace}.${pluginName} = cases => defaultCase => key => {
      const useFn = fn => typeof fn === 'function' ? fn() : fn
      const ${pluginName}NoFn = cases => defaultCase => key => key in cases ? cases[key] : defaultCase
      return useFn(${pluginName}NoFn(cases)(defaultCase)(key))
    }
  }`).ast.program.body[0]

  return {
    name: pluginName,
    visitor: {
      Program: function (path) {
        path.node.body.unshift(header)
      },
      SwitchStatement: function (path) {
        const cases = []
        let defaultCase
        path.node.cases.forEach((el, idx, arr) => {
          const csqt =
                el.consequent.length <= 0 && arr[idx + 1]
                ? [t.returnStatement(
                  t.callExpression(
                    t.memberExpression(
                      t.identifier(pluginObj),
                      arr[idx + 1].test, true),
                    []
                  )
                )]
                : el.consequent.filter(el => el.type !== 'BreakStatement')
          if (el.test === null) {
            defaultCase = t.arrowFunctionExpression([], t.blockStatement(csqt))
          } else {
            cases.push(t.objectProperty(
              el.test,
              t.arrowFunctionExpression([], t.blockStatement(csqt))
            ))
          }
        })

        path.replaceWithMultiple(
          [
            t.variableDeclaration(
              'let',
              [
                t.variableDeclarator(
                  t.identifier(pluginObj)
                )
              ]
            ),
            t.variableDeclaration(
              'const',
              [
                t.variableDeclarator(
                  t.identifier(pluginVal),
                  t.callExpression(
                    t.callExpression(
                      t.callExpression(
                        t.memberExpression(
                          t.identifier(pluginNamespace),
                          t.identifier(pluginName)
                        ), [
                          t.assignmentExpression(
                            '=',
                            t.identifier(pluginObj),
                            t.objectExpression(cases)
                          )
                        ]
                      ), defaultCase ? [defaultCase] : []
                    ), [path.node.discriminant]
                  )
                )
              ]
            ),
            t.ifStatement(
              t.identifier(pluginVal),
              t.blockStatement([
                t.returnStatement(
                  t.identifier(pluginVal)
                )
              ])
            )
          ]
        )
      }
    }
  }
}

module.exports = beswitchPlugin
