if (typeof window.beswitch !== 'function') {
  window.beswitch = cases => defaultCase => key => {
    const useFn = fn => (typeof fn === 'function' ? fn() : fn)
    const beswitchNoFn = cases => defaultCase => key => (key in cases ? cases[key] : defaultCase)
    return useFn(beswitchNoFn(cases)(defaultCase)(key))
  }
}

const beswitchedFn = key => {
  let result
  let beswitchObj

  const beswitchVal = window.beswitch(beswitchObj = {
    0: () => {
      return beswitchObj[1]()
    },

    1: () => {
      doNothing()
      result = 'first'
    },

    'other': () => {
      result = 'second'
    },

    'early': () => {
      return beswitchObj['also early']()
    },

    'also early': () => {
      return 'quit early'
    },

    'log': () => {
      console.log('thing')
    },

    'nothing': () => {}
  })(() => {
    result = 'third'
  })(key)

  if (beswitchVal) {
    return beswitchVal
  }

  return result
}

const doNothing = () => 'nothing'

module.exports = beswitchedFn
