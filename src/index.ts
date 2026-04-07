'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
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

export const NuqsAdapter: NuqsAdapter = createAdapterProvider(
	useNuqsStorybookAdapter,
);
