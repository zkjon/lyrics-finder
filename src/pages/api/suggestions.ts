import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const query = url.searchParams.get('q')?.trim();

	console.log('Received query via GET:', query);
	console.log('Full URL:', url.toString());
	console.log('Search params:', Object.fromEntries(url.searchParams));

	if (!query) {
		console.log('Query is empty or missing');
		return new Response(JSON.stringify({ error: 'Missing search query' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const response = await fetch(
			`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`,
		);

		if (!response.ok) {
			console.error(
				'API response not ok:',
				response.status,
				response.statusText,
			);
			throw new Error(`API responded with status: ${response.status}`);
		}

		const data = await response.json();
		console.log('API response data:', data);

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err) {
		console.error('Error fetching suggestions:', err);
		return new Response(
			JSON.stringify({ error: 'Failed to fetch suggestions' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}
};
