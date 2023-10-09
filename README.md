<a href="https://promisesaplus.com/">
    <img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.0 compliant" align="right" />
</a>

TypeScript Promise implementation conformant with the [PromiseA+](https://promisesaplus.com) specification.

> This implementation was written while studying the internal implementation of Promise. Do not use this implementation in your projects.

Implemented instance methods:

-   then
-   catch
-   finally

Implemented static methods:

-   resolve
-   reject
-   all
-   allSettled
-   race
-   any

## Tests

```bash
npm run test:aplus # run PromiseA+ tests.

npm run test:static # run tests for static methods.

npm run test # run all tests.
```
