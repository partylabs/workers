import { Env } from '..';

export async function prices(env: Env): Promise<Response> {
	return new Response('Price response');
}
