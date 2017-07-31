const plugin = function (babel) {
  const { types: t } = babel

  const namespace = typeof window !== 'undefined' ? 'window' : 'global'

  const header = babel.transform(`if (typeof ${namespace}.switchcase !== 'function') {
  ${namespace}.switchcase = cases => defaultCase => key => {
      const executeIfFunction = f => typeof f === 'function' ? f() : f
      const switchcaseNoFn = cases => defaultCase => key => key in cases ? cases[key] : defaultCase
      return executeIfFunction(switchcaseNoFn(cases)(defaultCase)(key))
    }
  }`).ast.program.body[0]

  return {
    name: 'switch-to-functional',
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
                ? [t.returnStatement(t.callExpression(t.memberExpression(t.identifier('switchObj'), arr[idx + 1].test, true), []))]
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
              'const',
              [
                t.variableDeclarator(
                  t.identifier('switchVal'),
                  t.callExpression(
                    t.callExpression(
                      t.callExpression(
                        t.memberExpression(
                          t.identifier(namespace),
                          t.identifier('switchcase')
                        ), [
                          t.assignmentExpression(
                            '=',
                            t.identifier('switchObj'),
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
              t.identifier('switchVal'),
              t.returnStatement(
                t.identifier('switchVal')
              )
            )
          ]
        )
      }
    }
  }
}

module.exports = plugin
