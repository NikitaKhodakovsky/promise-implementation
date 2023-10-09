import { describe, test, expect } from '@jest/globals'
import { PromiseImplementation } from '../src'
import { createNonThenables } from './utils'

describe('allSettled', () => {
    test('Should resolve with the array of results of the passed promises', async () => {
        expect.assertions(1)

        const value1 = 0
        const value2 = 1
        const value3 = 2
        const value4 = 3

        const promises = [
            Promise.resolve(value1),
            Promise.reject(value2),
            Promise.reject(value3),
            Promise.resolve(value4)
        ]

        const expected: PromiseSettledResult<unknown>[] = [
            { status: 'fulfilled', value: value1 },
            { status: 'rejected', reason: value2 },
            { status: 'rejected', reason: value3 },
            { status: 'fulfilled', value: value4 }
        ]

        await PromiseImplementation.allSettled(promises)
            .then(result => expect(result).toStrictEqual(expected))
            .catch(() => { throw new Error() })
    })

    test('Should resolve with the empty array if passed iterable is empty', async () => {
        expect.assertions(1)

        await PromiseImplementation.allSettled([])
            .then((result) => expect(result).toStrictEqual([]))
            .catch(() => { throw new Error() })
    })

    describe('Should treat none-thenable values as already fulfilled promise', () => {
        for (const { message, value } of createNonThenables()) {
            test(`When value is ${message}`, async () => {
                expect.assertions(1)

                const promises = [
                    value,
                    Promise.resolve('fulfilled'),
                    Promise.reject('rejected')
                ]

                const expected: PromiseSettledResult<unknown>[] = [
                    { status: 'fulfilled', value },
                    { status: 'fulfilled', value: 'fulfilled' },
                    { status: 'rejected', reason: 'rejected' }
                ]

                await PromiseImplementation.allSettled(promises)
                    .then(result => expect(result).toStrictEqual(expected))
                    .catch(() => { throw new Error() })
            })
        }
    })
})
