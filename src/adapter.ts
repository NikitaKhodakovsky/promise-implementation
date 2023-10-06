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

