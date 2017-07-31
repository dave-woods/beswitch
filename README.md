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
