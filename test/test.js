const { spawn } = require('child_process')
const babel = require('babel-core')
const beswitch = require('../babel-plugin-beswitch.js')
const { promisify } = require('util')
const transform = promisify(babel.transformFile)

const objEquals = obj1 => obj2 => {
  return Object.keys(obj1).reduce((acc, k) => acc && obj2.hasOwnProperty(k) && ((obj1[k] === obj2[k]) || (typeof obj1[k] === 'object' && typeof obj2[k] === 'object' && objEquals(obj1[k])(obj2[k]))), true)
}

const test = async function () {
  try {
    const inputFile = process.argv[2]
    const expectedFile = process.argv[3]

    const output = await transform(inputFile, {
      plugins: [beswitch]
    })
    const expected = await transform(expectedFile)

    return {
      output: output.code.replace(/(\n|\r)+/g, '\n'),
      expected: expected.code.replace(/(\n|\r)+/g, '\n'),
      test: output.code.replace(/\s+/g, ' ') === expected.code.replace(/\s+/g, ' ')
    }
  } catch (err) {
    throw err
  }
}

test().then(data => {
  if (data.test) {
    console.log('Output matches expected.')
  } else {
    console.error('Output does not match expected.')
    const diff = `diff <(echo "${data.output}") <(echo "${data.expected}")`
    const child = spawn('bash', ['-c', diff])
    child.stdout.on('data', data => {
      console.log('' + data)
    })
    child.stderr.on('data', data => {
      console.error('Error: ' + data)
    })
  }
}).catch(err => {
  console.log('Issue in test():')
  console.error(err)
})
