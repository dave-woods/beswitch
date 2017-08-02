const beswitchPlugin = function (babel) {
  const { types: t } = babel

  const pluginNamespace = typeof window !== 'undefined' ? 'window' : 'global'
  const pluginName = 'beswitch'
  const pluginObj = `${pluginName}Obj`
  const pluginVal = `${pluginName}Val`
  let varsDeclared = false

  const insert =
        t.ifStatement(
          t.binaryExpression(
            '!==',
            t.unaryExpression(
              'typeof',
              t.memberExpression(
                t.identifier(pluginNamespace),
                t.identifier(pluginName)
              )
            ),
            t.stringLiteral('function')
          ),
          t.blockStatement([
            t.expressionStatement(
              t.assignmentExpression(
                '=',
              t.memberExpression(
                  t.identifier(pluginNamespace),
                  t.identifier(pluginName)
              ),
                t.arrowFunctionExpression(
                  [t.identifier('cases')],
                  t.arrowFunctionExpression(
                    [t.identifier('defaultCase')],
                    t.arrowFunctionExpression(
                      [t.identifier('key')],
                      t.blockStatement([
                        t.variableDeclaration(
                          'const',
                          [
                            t.variableDeclarator(
                              t.identifier('useFn'),
                              t.arrowFunctionExpression(
                                [t.identifier('fn')],
                                t.conditionalExpression(
                                  t.binaryExpression(
                                    '===',
                                    t.unaryExpression('typeof', t.identifier('fn')),
                                    t.stringLiteral('function')
                                  ),
                                  t.callExpression(t.identifier('fn'), []),
                                  t.identifier('fn')
                                )
                              )
                            )
                          ]
                        ),
                        t.variableDeclaration(
                          'const',
                          [
                            t.variableDeclarator(
                              t.identifier('beswitchNoFn'),
                              t.arrowFunctionExpression(
                                [t.identifier('casesNoFn')],
                                t.arrowFunctionExpression(
                                  [t.identifier('defaultCaseNoFn')],
                                  t.arrowFunctionExpression(
                                    [t.identifier('keyNoFn')],
                                    t.conditionalExpression(
                                      t.callExpression(
                                        t.memberExpression(
                                          t.identifier('casesNoFn'),
                                          t.identifier('hasOwnProperty')
                                        ), [t.identifier('keyNoFn')]
                                      ),
                                      t.memberExpression(
                                        t.identifier('casesNoFn'),
                                        t.identifier('keyNoFn'),
                                        true
                                      ),
                                      t.identifier('defaultCaseNoFn')
                                    )
                                  )
                                )
                              )
                            )
                          ]
                        ),
                        t.returnStatement(
                          t.callExpression(
                            t.identifier('useFn'),
                            [t.callExpression(
                              t.callExpression(
                                t.callExpression(
                                  t.identifier('beswitchNoFn'),
                                  [t.identifier('cases')]
                                ),
                                [t.identifier('defaultCase')]),
                              [t.identifier('key')]
                              )
                            ]
                          )
                        )
                      ])
                    )
                  )
                )
              )
            )
          ])
        )

  return {
    name: pluginName,
    visitor: {
      Program: function (path) {
        path.node.body.unshift(insert)
      },
      SwitchStatement: function (path) {
        const cases = []
        let defaultCase
        let useReturn = false
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
          useReturn = useReturn || csqt.some(el => el.type === 'ReturnStatement')
          if (el.test === null) {
            defaultCase = t.arrowFunctionExpression([], t.blockStatement(csqt))
          } else {
            cases.push(t.objectProperty(
              el.test,
              t.arrowFunctionExpression([], t.blockStatement(csqt))
            ))
          }
        })

        const mainFn =
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

        if (!varsDeclared) {
          path.insertBefore(
            t.variableDeclaration(
              'let',
              [
                t.variableDeclarator(
                  t.identifier(pluginObj)
                ),
                t.variableDeclarator(
                  t.identifier(pluginVal)
                )
              ]
            )
          )
          varsDeclared = true
        }
        path.replaceWith(
          useReturn ? t.assignmentExpression(
            '=',
            t.identifier(pluginVal),
            mainFn
          )
          : mainFn
        )
        if (useReturn) {
          path.insertAfter(
            t.ifStatement(
              t.identifier(pluginVal),
              t.blockStatement([
                t.returnStatement(
                  t.identifier(pluginVal)
                )
              ])
            )
          )
        }
      }
    }
  }
}

module.exports = beswitchPlugin
