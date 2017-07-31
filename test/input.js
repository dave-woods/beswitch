const beswitchedFn = key => {
  let result
  switch (key) {
    case 0:
    case 1:
      doNothing()
      result = 'first'
      break
    case 'other':
      result = 'second'
      break
    case 'early':
    case 'also early':
      return 'quit early'
    case 'log':
      console.log('thing')
    default:
      result = 'third'
    case 'nothing':
  }
  return result
}

const doNothing = () => 'nothing'

module.exports = beswitchedFn
