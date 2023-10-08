import { describe, test, expect } from '@jest/globals'
import { PromiseImplementation } from '../src'
import { createNonThenables } from './utils'

describe('race', () => {
    describe('Should inherit state of first settled promise', () => {
        test('When first settled promise is fulfilled', async () => {
            expect.assertions(1)

            const expected = 1

            const promise1 = Promise.resolve(expected)
            const promise2 = Promise.resolve(3)
            const promise3 = Promise.reject(2)

            await PromiseImplementation
                .race([promise1, promise2, promise3])
                .then(value => expect(value === expected).toBe(true))
                .catch(v => { throw new Error() })
        })

        test('When first settled promise is rejected', async () => {
            expect.assertions(1)

            const expected = 1

            const promise1 = Promise.reject(expected)
            const promise2 = Promise.reject(2)
            const promise3 = Promise.resolve(3)

            await PromiseImplementation
                .race([promise1, promise2, promise3])
                .then(() => { throw new Error() })
                .catch(value => expect(value === expected).toBe(true))
        })
    })

    describe('Should resolve with non-thenable values', () => {
        for (const { message, value } of createNonThenables()) {
            test(`When value is ${message}`, async () => {
                expect.assertions(1)

                await PromiseImplementation.race([value])
                    .then(v => expect(value === v).toBe(true))
                    .catch(() => { throw new Error() })
            })
        }
    })
})
