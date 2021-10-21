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
}

// example 
const { log } = console
const p1 = new LPromise((resolve, reject) => {
  resolve(2)
  log(1)
}).then(res => {
  log(res)
  return 3
}).then(res => log(res))
log(0)
