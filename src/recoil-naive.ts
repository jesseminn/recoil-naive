import { useEffect, useState } from 'react';

type Callback<T> = (arg: T) => void;

type AtomOptions<T> = {
    key: string;
    default: T;
};

type AtomState<T = any> = {
    key: string;
    value: T;
    callbacks: Callback<T>[];
    get(): T;
    set(value: T): void;
    subscribe(callback: Callback<T>): void;
    unsubscribe(callback: Callback<T>): void;
};

const states: Record<string, AtomState> = {};

export const atom = <T>(options: AtomOptions<T>) => {
    states[options.key] = {
        key: options.key,
        value: options.default,
        callbacks: [],
        get() {
            return this.value;
        },
        set(value) {
            this.value = value;
            this.callbacks.forEach(callback => callback(value));
        },
        subscribe(callback) {
            this.callbacks.push(callback);
        },
        unsubscribe(callback) {
            this.callbacks = this.callbacks.filter(v => v !== callback);
        },
    } as AtomState<T>;

    return options.key;
};

export const useRecoilState = <T>(key: string) => {
    const state = states[key] as AtomState<T>;
    if (!state) {
        throw new Error(`There is no state matching key ${key}`);
    }

    const [value, setValue] = useState(state.get());

    useEffect(() => {
        const callback = (newValue: T) => {
            setValue(newValue);
        };
        state.subscribe(callback);
        return () => {
            state.unsubscribe(callback);
        };
    }, []);

    return [state.get(), (newValue: T) => state.set(newValue)];
};

type SelectorOptions<T, U> = {
    key: string;
    get({ get }: { get: (atomKey: string) => T }): any;
};

const selectors: Record<string, any> = {};

export const selector = <T, U = T>(options: SelectorOptions<T, U>) => {
    selectors[options.key] = options.get;
    return options.key;
};

export const useRecoilValue = (key: string) => {
    const selectorGet = selectors[key];

    if (!selectorGet) {
        throw new Error(`There is no selector matching key ${key}`);
    }

    const get = (atomKey: string) => {
        const [value] = useRecoilState(atomKey);
        return value;
    };

    return selectorGet({
        get,
    });
};
