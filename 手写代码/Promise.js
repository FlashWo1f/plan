const isFn = fn => typeof fn === 'function' 
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
const PENDING = 'pending'

class LPromise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.callbacks = []
    try {
      executor(this.resolve, this.reject)
    } catch (error) {
      this.reject(error)
    }
  }

  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED
      this.value = value
      for (const cb of this.callbacks) {
        cb.onFulfilled(value)
      }
    }
  }

  reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED
      this.reason = reason
      for (const cb of this.callbacks) {
        cb.onRejected(reason)
      }
    }
  }

  then = (onFulfilled, onRejected) => {
    !isFn(onRejected) && (onRejected = err => { throw err })
    !isFn(onFulfilled) && (onFulfilled = val => val)

    const p2 = new LPromise((resolve, reject) => {
      const makeResolvedMicrotask = () => {
        queueMicrotask(() => {
          this.handleResult(onFulfilled(this.value), resolve, reject)
        })
      }
      
      const makeRejectedMicrotask = () => {
        queueMicrotask(() => {
          this.handleResult(onRejected(this.reason), resolve, reject)
        })
      }

      if (this.status === REJECTED) {

        makeRejectedMicrotask()

      } else if (this.status === FULFILLED) {
        
        makeResolvedMicrotask()

      } else {

        this.callbacks.push({
          onFulfilled: makeResolvedMicrotask,
          onRejected: makeRejectedMicrotask,
        })

      }
    })
    return p2
  }

  handleResult = (result, resolve, reject) => {
    if (result instanceof LPromise) {
      result.then(resolve, reject)
    } else {
      resolve(result)
    }
  }

  catch = (onRejected) => this.then(null, onRejected) 

  static all = (tasks) => {
    if (!Array.isArray(tasks)) return
    return new LPromise((resolve, reject) => {
      let result = [], count = 0
      tasks.forEach((item, idx) => {
        item.then(
          res => {
            // 保证结果的顺序
            result[idx] = res
            if (++count === tasks.length) resolve(result)
          },
          reject
        )
      })
    })
  }

  static race = (tasks) => {
    if (!Array.isArray(tasks)) return
    return new LPromise((resolve, reject) => {
      tasks.forEach(item => {
        if (item && isFn(item.then)) {
          item.then(res => {
            resolve(res)
          }, reject)
        }
      })
    })
  }
}

const { log } = console
// example 1 start
// const p1 = new LPromise((resolve, reject) => {
//   resolve(2)
//   log(1)
// }).then(res => {
//   log(res)
//   return 3
// }).then(res => log(res))
// log(0)
// example 1 end

// example 2 start
const pp1 = new LPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('all1')
  }, 300)
})
const pp2 = new LPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('all2')
  }, 100)
})
const pp3 = new LPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('all3')
  }, 50)
})
const pp4 = new LPromise((resolve, reject) => {
  setTimeout(() => {
    reject('all4')
  }, 200)
})
// const all1 = LPromise.all([pp1, pp2, pp3]).then(res => {
//   console.log('all fulfilled', res)
// })
const all2 = LPromise.all([pp4, pp2, pp3]).then(res => {
}, err => console.log('someone rejected', err))
// example 2 end


