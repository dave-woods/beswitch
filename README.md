# babel-plugin-switch-to-functional

Converts a JavaScript switch statement to an equivalent function. Inspired by and based on an [article by Joel Thoms](https://hackernoon.com/rethinking-javascript-eliminate-the-switch-statement-for-better-code-5c81c044716d).

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
const key = 'whatever';

window.switchcase({
  0: () => { doThing() },
  1: () => { doSecondThing() },
  'other': () => { doOtherThing() }
})(() => { doDefaultThing() })(key);
```

A more complex example, inside a function, with returns and fall-throughs:
```javascript
const before = key => {
  let result;
  switch (key) {
    case 0:
    case 1:
      doThing();
      result = 'first';
      break;
    case 'other':
      result = 'second';
      break;
    case 'also early':
    case 'early':
      return 'quit early'
    case 'log':
      console.log('thing')
    default:
      result = 'third';
    case 'nothing':
  }
  return result
}
```
...which is transformed into...
```javascript
const after = key => {
  let result

  const switchVal = window.switchcase(switchObj = {
    0: () => { return switchObj[1]() },
    1: () => {
      doThing()
      result = 'first'
    },
	'other': () => { result = 'second' },
    'also early': () => { return switchObj['early']() },
    'early': () => { return 'quit early' },
    'log': () => { console.log('thing') },
    'nothing': () => {}
  })(() => { result = 'third' })(key);

  if (switchVal)
    return switchVal;

  return result
}
```
