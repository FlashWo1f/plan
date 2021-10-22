function insertSort(arr) {
  let result = []
  for (let i = 0; i < arr.length; i++) {
    // 第一个先入
    if (!result.length) {
      result.push(arr[i])
      continue
    }
    let val = arr[i]
    let flag = false
    let len = result.length
    for (let j = 0; j < len; j++) {
      if (val < result[j]) {
        result.splice(j, 0, val)
        flag = true
        // 之前没有加下面这行 会重复 splice
        break
      }
    }
    !flag && result.push(val)
  }
  return result
}

function getExample(n) {
  let arr = []
  for(let i = 0; i < n; ++i) {
    arr.push(Math.random().toFixed(3) * 1000)
  }
  return arr
}

const now = Date.now()
let arr = getExample(50000)

console.log('result', insertSort(arr))
console.log('run out time', Date.now() - now)

