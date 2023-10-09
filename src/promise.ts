const Fallback = {
    onFulfilled: (v: unknown) => {
        return v
    },
    onRejected: (r: unknown) => {
        throw r
    }
}

enum Status {
    PENDING,
    FULFILLED,
    REJECTED
}

function isThenable(value: any): value is PromiseLike<unknown> {
    return !!(value && typeof value.then === 'function')
}

export type Resolve = <T>(value: T | PromiseLike<T>) => any
export type Reject = (reason: any) => any
export type Executor = (resolve: Resolve, reject: Reject) => any

export type FulfilledHandler<T, R> = (value: T) => R | PromiseLike<R>
export type RejectedHandler<R> = (reason: any) => R | PromiseLike<R>
export type FinallyHandler = () => any

export class PromiseImplementation<T> implements PromiseLike<T> {
    protected deferred: [PromiseImplementation<unknown>, unknown, unknown][] = []
    protected status = Status.PENDING
    protected resolved = false
    protected result: any

    constructor(executor?: Executor) {
        let isCalled = false

        const resolve: Resolve = (value) => {
            if (isCalled) return
            isCalled = true
            this._resolve(value)
        }

        const reject: Reject = (reason) => {
            if (isCalled) return
            isCalled = true
            this._reject(reason)
        }

        try {
            typeof executor === 'function' && executor(resolve.bind(this), reject.bind(this))
        } catch (e) {
            reject(e)
        }
    }

    /* Implementation of Promise Resolution Procedure according to the PromiseA+ specification. */
    protected _resolve(x: any) {
        const promise = this

        if (promise === x) {
            promise._reject(new TypeError('promise === x'))
        } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
            let isHandlerCalled = false

            try {
                const then = x.then

                if (typeof then === 'function') {
                    then.call(
                        x,
                        (y: unknown) => {
                            if (isHandlerCalled) return
                            isHandlerCalled = true
                            promise._resolve(y)
                        },
                        (r: unknown) => {
                            if (isHandlerCalled) return
                            isHandlerCalled = true
                            promise._reject(r)
                        }
                    )
                } else {
                    promise._fulfill(x)
                }
            } catch (e) {
                !isHandlerCalled && promise._reject(e)
            }
        } else {
            promise._fulfill(x)
        }
    }

    protected propagate() {
        if (this.status === Status.PENDING) return

        setTimeout(() => {
            for (const [promise, onFulfilled, onRejected] of this.deferred) {
                const callback = this.status === Status.FULFILLED ? onFulfilled : onRejected
                const fallback = this.status === Status.FULFILLED ? Fallback.onFulfilled : Fallback.onRejected
                const handler = typeof callback === 'function' ? callback : fallback

                try {
                    promise._resolve(handler(this.result))
                } catch (e) {
                    promise._reject(e)
                }
            }

            this.deferred = []
        }, 0)
    }

    protected _fulfill(value: T) {
        this.settle(Status.FULFILLED, value)
    }

    protected _reject(reason: any) {
        this.settle(Status.REJECTED, reason)
    }

    protected settle(status: Status, result: unknown) {
        if (this.status === Status.PENDING) {
            this.status = status
            this.result = result
            this.propagate()
        }
    }

    public then<R1 = T, R2 = never>(onFulfilled?: FulfilledHandler<T, R1> | null, onRejected?: RejectedHandler<R2> | null): PromiseImplementation<R1 | R2> {
        const promise = new PromiseImplementation<R1 | R2>()

        this.deferred.push([promise, onFulfilled, onRejected])

        this.propagate()

        return promise
    }

    public catch<R>(onRejected?: RejectedHandler<R>): PromiseImplementation<T | R> {
        return this.then(null, onRejected)
    }

    public finally(onFinally?: FinallyHandler): PromiseImplementation<T> {
        return this.then(
            (v: T) => {
                onFinally && onFinally()
                return v
            },
            (r: any) => {
                onFinally && onFinally()
                throw r
            }
        )
    }

    public static resolve<T>(value?: T | PromiseLike<T>): PromiseImplementation<T> {
        return new PromiseImplementation(res => res(value))
    }

    public static reject<T = never>(reason?: any): PromiseImplementation<T> {
        return new PromiseImplementation((_, rej) => rej(reason))
    }

    public static race<T>(values: Iterable<T | PromiseLike<T>>): PromiseImplementation<T> {
        return new PromiseImplementation((resolve, reject) => {
            for (const value of values) {
                if (isThenable(value)) {
                    value.then(resolve, reject)
                } else {
                    resolve(value)
                    break
                }
            }
        })
    }

    public static any<T>(values: Iterable<T | PromiseLike<T>>): PromiseImplementation<T> {
        return new PromiseImplementation((resolve, reject) => {
            const reasons: any[] = []
            let rejected = 0
            let count = 0

            const createHandler = (index: number) => (reason: any) => {
                reasons[index] = reason
                ++rejected === count && reject(new AggregateError(reasons))
            }

            for (const value of values) {
                if (isThenable(value)) {
                    value.then(resolve, createHandler(count))
                } else {
                    resolve(value)
                    break
                }

                count++
            }

            count === rejected && reject(new AggregateError(reasons))
        })
    }

    public static all<T>(values: Iterable<T | PromiseLike<T>>): PromiseImplementation<T[]> {
        return new PromiseImplementation((resolve, reject) => {
            const result: T[] = []
            let fulfilled = 0
            let count = 0

            const createHandler = (index: number) => (value: T) => {
                result[index] = value
                ++fulfilled === count && resolve(result)
            }

            for (const value of values) {
                const promise = isThenable(value) ? value : this.resolve(value)
                promise.then(createHandler(count++), reject)
            }

            count === fulfilled && resolve(result)
        })
    }
}
