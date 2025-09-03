import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const artist = url.searchParams.get('artist')?.trim();
	const title = url.searchParams.get('title')?.trim();

	if (!artist || !title) {
		return new Response(JSON.stringify({ error: 'Missing artist or title' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const apiRes = await fetch(
			`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
		);
		const data = await apiRes.json();
		if (!apiRes.ok || !data.lyrics) {
			return new Response(
				JSON.stringify({ error: 'Lyrics not found for this song.' }),
				{
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}
		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (_err) {
		return new Response(JSON.stringify({ error: 'Failed to fetch lyrics' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
