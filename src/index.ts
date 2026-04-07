'use client';

import { useSearchParams } from 'next/navigation';
import {
	createElement,
	useCallback,
	useRef,
	useState,
	type ComponentProps,
	type ReactElement,
} from 'react';
import {
	type unstable_AdapterOptions as AdapterOptions,
	unstable_createAdapterProvider as createAdapterProvider,
	renderQueryString,
} from 'nuqs/adapters/custom';

function useNuqsStorybookAdapter() {
	const nextSearchParams = useSearchParams();
	const initialSearchParams = (
		nextSearchParams ?? new URLSearchParams()
	).toString();
	const locationSearchRef = useRef(initialSearchParams);
	const [searchParams, setSearchParams] = useState(
		() => new URLSearchParams(locationSearchRef.current),
	);
	const updateUrl = useCallback(
		(search: URLSearchParams, _options: AdapterOptions) => {
			const queryString = renderQueryString(search);
			setSearchParams(new URLSearchParams(search));
			locationSearchRef.current = queryString;
		},
		[],
	);
	return {
		searchParams,
		updateUrl,
	};
}

type NuqsAdapter = ReturnType<typeof createAdapterProvider>;
type NuqsAdapterProps = ComponentProps<NuqsAdapter>;

export const NuqsStorybookAdapter: NuqsAdapter = createAdapterProvider(
	useNuqsStorybookAdapter,
);

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
	props: Omit<NuqsAdapterProps, 'children'> = {},
) {
	return function NuqsStorybookAdapterDecorator(
		Story: React.ComponentType,
	): ReactElement {
		return createElement(
			NuqsStorybookAdapter,
			// @ts-expect-error - Ignore missing children error
			props,
			createElement(Story),
		);
	};
}
