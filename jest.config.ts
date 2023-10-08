import { Config } from '@jest/types'

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	verbose: true,
	testEnvironment: 'node',
	testMatch: ['**/test/**/*.test.ts']
}

export default config
