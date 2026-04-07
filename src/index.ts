'use client';

import { useSearchParams } from 'next/navigation';
import {
	createContext,
	createElement,
	useCallback,
	useContext,
	useRef,
	useSyncExternalStore,
	type ReactElement,
	type ReactNode,
} from 'react';
import {
	type unstable_AdapterOptions as AdapterOptions,
	unstable_createAdapterProvider as createAdapterProvider,
	renderQueryString,
} from 'nuqs/adapters/custom';

type SearchParamsStore = {
	subscribe: (listener: () => void) => () => void;
	getSnapshot: () => URLSearchParams;
	update: (search: URLSearchParams) => void;
	getRef: () => string;
};

function createSearchParamsStore(initial: string): SearchParamsStore {
	let currentRef = initial;
	let current = new URLSearchParams(initial);
	const listeners = new Set<() => void>();
	return {
		subscribe(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		getSnapshot() {
			return current;
		},
		update(search) {
			const queryString = renderQueryString(search);
			current = new URLSearchParams(search);
			currentRef = queryString;
			for (const listener of listeners) listener();
		},
		getRef() {
			return currentRef;
		},
	};
}

// Shared store context so all consumers (via createAdapterProvider) read
// from the same state that lives in the provider component.
const StoreContext = createContext<SearchParamsStore | null>(null);

function useNuqsStorybookAdapter() {
	const store = useContext(StoreContext);
	if (!store) {
		throw new Error(
			'[nuqs-storybook-adapter] useNuqsStorybookAdapter must be used within NuqsStorybookAdapter',
		);
	}
	const searchParams = useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getSnapshot,
	);
	const updateUrl = useCallback(
		(search: URLSearchParams, _options: AdapterOptions) => {
			store.update(search);
		},
		[store],
	);
	const getSearchParamsSnapshot = useCallback(() => {
		return new URLSearchParams(store.getRef());
	}, [store]);
	return {
		searchParams,
		updateUrl,
		getSearchParamsSnapshot,
	};
}

import type { unstable_AdapterContext as AdapterContext } from 'nuqs/adapters/custom';

const InnerProvider: ReturnType<typeof createAdapterProvider> =
	createAdapterProvider(useNuqsStorybookAdapter);

type NuqsStorybookAdapterProps = {
	children: ReactNode;
	defaultOptions?: AdapterContext['defaultOptions'];
	processUrlSearchParams?: AdapterContext['processUrlSearchParams'];
};

export function NuqsStorybookAdapter({
	children,
	defaultOptions,
	processUrlSearchParams,
}: NuqsStorybookAdapterProps): ReactElement {
	const nextSearchParams = useSearchParams();
	const initialSearchParams = (
		nextSearchParams ?? new URLSearchParams()
	).toString();
	const storeRef = useRef<SearchParamsStore | null>(null);
	if (!storeRef.current) {
		storeRef.current = createSearchParamsStore(initialSearchParams);
	}
	return createElement(
		StoreContext.Provider,
		{ value: storeRef.current },
		createElement(
			InnerProvider,
			{ defaultOptions, processUrlSearchParams, children },
		),
	);
}

/**
 * A Storybook decorator that wraps stories with the NuqsStorybookAdapter.
 *
 * The adapter reads initial search params from Storybook's mock router
 * (configured via story parameters), then manages state internally
 * so that nuqs updates are reflected in the UI.
 *
 * Usage:
 * ```tsx
 * // .storybook/preview.tsx
 * import { withNuqsStorybookAdapter } from 'nuqs-storybook-adapter'
 *
 * export const decorators = [withNuqsStorybookAdapter()]
 * ```
 */
export function withNuqsStorybookAdapter(
	props: Omit<NuqsStorybookAdapterProps, 'children'> = {},
) {
	return function NuqsStorybookAdapterDecorator(
		Story: React.ComponentType,
	): ReactElement {
		return createElement(
			NuqsStorybookAdapter,
			// @ts-expect-error - children provided via createElement's third arg
			props,
			createElement(Story),
		);
	};
}
