import { getSubscribePath } from './index';
import { createStore, Store, Reducer } from 'redux';

const reducer: Reducer<any, any> = (state = {}, action) =>
    (action.type === 'set') ? action.payload : state;

describe('getSubscribePath', () => {
    let store: Store;
    let obj: any;
    test('index contains getSubscribePath', () => {
        expect(getSubscribePath).toBeDefined();
        store = createStore(reducer);
        obj = getSubscribePath(store);
        expect(obj).toBeDefined();
        expect(obj).toHaveProperty('subscribePath');
        expect(obj).toHaveProperty('getStateByPath');
    });

    test('getStateByPath', () => {
        const { getStateByPath } = obj;
        store.dispatch({type: 'set', payload: {x: {y: {v: 'value1'}}}})
        expect(getStateByPath(['x', 'y', 'v'])).toBe('value1');
        expect(getStateByPath(['x', 'y_', 'v'])).toBeUndefined();
    });

    test('getStateByPath', () => {
        const { subscribePath, getStateByPath } = obj;

        const subscription1 = jest.fn();
        const clear1 = subscribePath(['x', 'y','v'], subscription1)

        const subscription2 = jest.fn();
        const clear2 = subscribePath(['x', 'y','v'], subscription2)

        const subscriptionRoot = jest.fn();
        const clearRoot = subscribePath([], subscriptionRoot)

        store.dispatch({type: 'set', payload: {x: {y: {v: 'value2'}}}})
        expect(subscription1).toBeCalledTimes(1);
        expect(subscription2).toBeCalledTimes(1);
        expect(subscriptionRoot).toBeCalledTimes(1);

        store.dispatch({type: 'set', payload: {x: {y: {v: 'value3'}}}})
        expect(subscription1).toBeCalledTimes(2);
        expect(subscription2).toBeCalledTimes(2);
        expect(subscriptionRoot).toBeCalledTimes(2);

        store.dispatch({type: 'set', payload: {x: {y: {v: 'value3'}}}})
        expect(subscription1).toBeCalledTimes(2);
        expect(subscription2).toBeCalledTimes(2);
        expect(subscriptionRoot).toBeCalledTimes(3);

        store.dispatch({type: 'set', payload: 'value4' })
        expect(subscription1).toBeCalledTimes(3);
        expect(subscription2).toBeCalledTimes(3);
        expect(subscriptionRoot).toBeCalledTimes(4);

        store.dispatch({type: 'set', payload: 'value5' })
        expect(subscription1).toBeCalledTimes(3);
        expect(subscription2).toBeCalledTimes(3);
        expect(subscriptionRoot).toBeCalledTimes(5);

        store.dispatch({type: 'set', payload: 'value5' })
        expect(subscription1).toBeCalledTimes(3);
        expect(subscription2).toBeCalledTimes(3);
        expect(subscriptionRoot).toBeCalledTimes(5);

        clear1()
        clearRoot()
        store.dispatch({type: 'set', payload: {x: {y: {v: 'value6'}}} })
        expect(subscription1).toBeCalledTimes(3);
        expect(subscription2).toBeCalledTimes(4);
        expect(subscriptionRoot).toBeCalledTimes(5);

        const subscription3 = jest.fn((v2) => {
            store.dispatch({type: 'set', payload: {x: {y: { v: `${v2}_from_queue`, v2 }}} })
        });
        subscribePath(['x', 'y', 'v2'], subscription3)

        store.dispatch({type: 'set', payload: {x: {y: { v: 'value6', v2: 'value7'}}} })
        store.dispatch({type: 'set', payload: {x: {y: { v: 'value6', v2: 'value8'}}} })
        expect(subscription2).toBeCalledTimes(7);
        expect(subscription3).toBeCalledTimes(2);

        expect(getStateByPath(['x', 'y', 'v'])).toBe('value8_from_queue');
        expect(getStateByPath(['x', 'y', 'v2'])).toBe('value8');


    });
});
