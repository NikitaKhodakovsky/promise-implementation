import { describe, test, expect } from '@jest/globals'
import { createNonThenables } from './utils'
import { PromiseImplementation } from '../src'

describe('all', () => {
    test('Should resolve if all passed promises are fulfilled', async () => {
        expect.assertions(1)

        const values = createNonThenables().map(({ value }) => value)

        const promises = values.map(value => Promise.resolve(value))

        await PromiseImplementation.all(promises)
            .then(result => expect(result).toStrictEqual(values))
            .catch(() => { throw new Error() })
    })

    test('Should reject with the reason of the first rejected promise', async () => {
        expect.assertions(1)

        const expected = 'hello'

        const promises = [
            Promise.resolve(1),
            Promise.resolve(2),
            PromiseImplementation.reject(expected),
            PromiseImplementation.reject(3),
            Promise.resolve(4)
        ]

        await PromiseImplementation.all(promises)
            .then(() => { throw new Error() })
            .catch(reason => expect(reason === expected).toBe(true))
    })

    test('Should resolve with empty array when passed iterable is empty', async () => {
        expect.assertions(1)

        await PromiseImplementation.all([])
            .then((value) => expect(value).toStrictEqual([]))
            .catch(() => { throw new Error() })
    })

    describe('Should treat none-thenable values as already fulfilled promise', () => {
        for (const { message, value } of createNonThenables()) {
            test(`When value is ${message}`, async () => {
                expect.assertions(1)

                await PromiseImplementation.all([value])
                    .then(result => expect(result).toStrictEqual([value]))
                    .catch(() => { throw new Error() })
            })
        }
    })
})
