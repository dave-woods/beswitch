// const fs = require('fs')
const babel = require('babel-core')
const beswitch = require('../babel-plugin-beswitch.js')
const { promisify } = require('util')
// const readFileAsync = promisify(fs.readFile)
const transform = promisify(babel.transformFile)

const test = async function () {
  try {
    const inputFile = process.argv[2]
    const expectedFile = process.argv[3]

    const output = await transform(inputFile, {
      plugins: [beswitch]
    })
    const expected = await transform(expectedFile)

    console.log(output.ast)
    console.log(expected.sat)

    return output.ast === expected.ast
    // const input = await readFileAsync(inputFile, { encoding: 'utf8' })
    // const expected = await readFileAsync(expectedFile, { encoding: 'utf8' })

    // const output = await babel.transform(input.toString(), {
    //   plugins: [beswitch]
    // })
    // 

    // console.log(output.code.replace(/;/g, ''))
    // console.log(output.code.replace(/;/g, ' ').replace(/(\s+|$)/g, ' '))
    // console.log(expected.toString().replace(/(\s+|$)/g, ' '))
    // return output.code.replace(/;/g, ' ').replace(/(\s+|$)/g, ' ') === expected.toString().replace(/(\s+|$)/g, ' ')
  } catch (err) {
    throw err
  }
}

test().then(data => {
  if (data) {
    console.log('Output matches expected.')
  } else {
    console.error('Output does not match expected.')
  }
}).catch(err => {
  console.log('Issue in test():')
  console.error(err)
})
