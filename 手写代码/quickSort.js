const swap = (arr, a, b) => {
  if (a === b) return
  [arr[a], arr[b]] = [arr[b], arr[a]]
}

const findPivot = (arr, pivot, left, right) => {
  let pivotIndex = left
  const pivotVal = arr[pivot]
  for (let i = left; i <= right; i++) {
    if (arr[i] < pivotVal) {
      swap(arr, i, pivotIndex)
      pivotIndex++
    }
  }
  swap(arr, pivotIndex, pivot)
  return pivotIndex
}

const quickSort = (arr, left = 0, right = arr.length - 1) => {
  if (right > left) {
    const pivotIndex = findPivot(arr, right, left, right)
    quickSort(arr, left, ((pivotIndex - 1) > right ? right : (pivotIndex - 1)))
    quickSort(arr, ((pivotIndex + 1) < left) ? left : (pivotIndex + 1), right)
  }
}

function getExample(n) {
  let arr = []
  for(let i = 0; i < n; ++i) {
    arr.push(Math.random().toFixed(3) * 1000)
  }
  return arr
}

const now = Date.now()
let arr = getExample(20)
quickSort(arr)
// 快排真的好快呀 相比 插入排序 n²
console.log('result', arr)
console.log('run out time', Date.now() - now)
