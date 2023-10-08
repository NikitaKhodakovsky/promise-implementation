export class Item<T> {
    message: string
    value: T

    constructor(message: string, value: T) {
        this.message = message
        this.value = value
    }
}

export function createNonThenables(): Item<unknown>[] {
    const items = [
        new Item('negative number', -1),
        new Item('zero', 0),
        new Item('positive number', 1),
        new Item('true', true),
        new Item('false', false),
        new Item('null', null),
        new Item('undefined', undefined),
        new Item('empty string', ''),
        new Item('string', 'string'),
        new Item('object', {})
    ]

    return [
        ...items,
        ...items.map(({ message, value }) => new Item(`object with then property that is ${message}`, { then: value })),
        new Item('function', () => { })
    ]
}
