import { create, act } from 'react-test-renderer';
import {createElement} from "react";
import * as React from "react";
import {createStore, Reducer, Store} from "redux";
import { getUseStorePath, UseStorePath } from "./index";

const reducer: Reducer<any, any> = (state = {}, action) =>
    (action.type === 'set') ? action.payload : state;

interface AppProps {
    store: ExStore;
    onRender: (v: unknown, v2: unknown) => void;
}

const App: React.FC<AppProps> = ({ store, onRender }) => {
    const { useStorePath } = store;
    const v = useStorePath<string>(['a','b']);
    const v2 = useStorePath<string>(undefined);
    onRender(v, v2);
    return null;
};

interface ExStore extends Store {
    useStorePath: UseStorePath;
}

describe('test hook', () => {
    const store = createStore(reducer);
    const exStore: ExStore = {
        ...store,
        useStorePath: getUseStorePath(store)
    };
    test('create app actor', () => {
        const onRender = jest.fn();
        create(createElement(App, { store: exStore, onRender }));
        expect(onRender).toBeCalledTimes(1);
        act(() => {
            store.dispatch({type: 'set', payload: 'value1' })
        });
        expect(onRender).toBeCalledTimes(1);

        act(() => {
            store.dispatch({type: 'set', payload: {a:{b:'value2'}} })
        });
        expect(onRender).toBeCalledTimes(2);
        expect(onRender).lastCalledWith('value2', undefined);
    });
});
