# babel-plugin-beswitch

Babel Plugin which converts a JavaScript switch statement to an equivalent function. Inspired by and based on an [article by Joel Thoms](https://hackernoon.com/rethinking-javascript-eliminate-the-switch-statement-for-better-code-5c81c044716d).

The function currently pollutes the window/global namespace, though this will most likely be changed soon.

## Usage:

Usage is as with any Babel Plugin. For example:
```javascript
const babel = require('babel-core')
const beswitch = require('./babel-plugin-beswitch.js')

const input = getSourceCode() // Source code to be transformed (as plaintext)
const output = babel.transform(input, {
	plugins: [beswitch]
}).code // Transformed code (as plaintext)
```

### Example:

This switch statement is transformed into the below function call, with the required function defined as needed:

```javascript
const key = 'whatever'
switch (key) {
  case 0:
    doThing()
    break
  case 1:
    doSecondThing()
    break
  case 'other':
    doOtherThing()
    break
  default:
    doDefaultThing()
}
```
...which is transformed into...
```javascript
const key = 'whatever'

window.beswitch({
  0: () => { doThing() },
  1: () => { doSecondThing() },
  'other': () => { doOtherThing() }
})(() => { doDefaultThing() })(key)
```

A more complex example, inside a function, with returns and fall-throughs:
```javascript
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

  // other code

  return result
}
```
...which is transformed into...
```javascript
const beswitchedFn = key => {
  let result
  let beswitchObj, beswitchVal

  beswitchVal = window.beswitch(beswitchObj = {
    0: () => { return beswitchObj[1]() },
    1: () => {
      doNothing()
      result = 'first'
    },
    'other': () => { result = 'second' },
    'early': () => { return beswitchObj['also early']() },
    'also early': () => { return 'quit early' },
    'log': () => { console.log('thing') },
    'nothing': () => {}
  })(() => { result = 'third' })(key)

  if (beswitchVal) {
    return beswitchVal
  }

  // other code

  return result
}
```
