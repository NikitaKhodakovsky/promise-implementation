import { describe, test, expect } from '@jest/globals'
import { PromiseImplementation } from '../src'
import { createNonThenables } from './utils'

describe('any', () => {
    test('Should inherit state of the first fulfilled promise', async () => {
        expect.assertions(1)

        const expected = 0

        const promises = [
            Promise.reject(1),
            Promise.reject(2),
            Promise.resolve(expected),
            Promise.resolve(4)
        ]

        await PromiseImplementation.any(promises)
            .then(value => expect(value === expected).toBe(true))
            .catch(() => { throw new Error() })
    })

    test('Should reject if none of the passed promises are fulfilled', async () => {
        expect.assertions(2)

        const values = [-1, 1, 0, null, false, undefined, true]

        const promises = values.map(value => Promise.reject(value))

        await PromiseImplementation.any(promises)
            .then(() => { throw new Error() })
            .catch((reason) => {
                expect(reason).toBeInstanceOf(AggregateError)
                expect(Array.from(reason.errors)).toStrictEqual(values)
            })
    })

    test('Should reject when iterable is empty', async () => {
        expect.assertions(2)

        await PromiseImplementation.any([])
            .then(() => { throw new Error() })
            .catch((reason) => {
                expect(reason).toBeInstanceOf(AggregateError)
                expect(Array.from(reason.errors)).toStrictEqual([])
            })
    })

    describe('Should resolve with non-thenable values', () => {
        for (const { message, value } of createNonThenables()) {
            test(`When value is ${message}`, async () => {
                expect.assertions(1)

                const promises = [
                    value,
                    PromiseImplementation.resolve('resolve'),
                    PromiseImplementation.reject('reject')
                ]

                await PromiseImplementation.any(promises)
                    .then(v => expect(v === value).toBe(true))
                    .catch(() => { throw new Error() })
            })
        }
    })
})
