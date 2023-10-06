import { PromiseImplementation } from './promise'

/* Adapter for PromiseA+ tests. */
export function deferred() {
    const result: any = {}

    result.promise = new PromiseImplementation((resolve, reject) => {
        result.resolve = resolve
        result.reject = reject
    })

    return result
}

export function resolved(value: unknown) {
    return PromiseImplementation.resolve(value)
}

export function rejected(reason: unknown) {
    return PromiseImplementation.reject(reason)
}
