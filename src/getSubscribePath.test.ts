import { getSubscribePath } from './index';
import {createStore, Store} from 'redux';
import {Reducer} from "react";

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
        const {subscribePath } = obj;
        const subscription = jest.fn();
        subscribePath(['x', 'y','v'], subscription)
        const subscriptionRoot = jest.fn();
        subscribePath([], subscriptionRoot)

        store.dispatch({type: 'set', payload: {x: {y: {v: 'value2'}}}})
        expect(subscription).toBeCalledTimes(1);
        expect(subscriptionRoot).toBeCalledTimes(1);

        store.dispatch({type: 'set', payload: {x: {y: {v: 'value3'}}}})
        expect(subscription).toBeCalledTimes(2);
        expect(subscriptionRoot).toBeCalledTimes(2);

        store.dispatch({type: 'set', payload: {x: {y: {v: 'value3'}}}})
        expect(subscription).toBeCalledTimes(2);
        expect(subscriptionRoot).toBeCalledTimes(3);

        store.dispatch({type: 'set', payload: 'value4' })
        expect(subscription).toBeCalledTimes(3);
        expect(subscriptionRoot).toBeCalledTimes(4);

        store.dispatch({type: 'set', payload: 'value5' })
        expect(subscription).toBeCalledTimes(3);
        expect(subscriptionRoot).toBeCalledTimes(5);

        store.dispatch({type: 'set', payload: 'value5' })
        expect(subscription).toBeCalledTimes(3);
        expect(subscriptionRoot).toBeCalledTimes(5);
    });
});
