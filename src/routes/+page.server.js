import { SECRET_MAPBOX_API_KEY } from '$env/static/private';

export function load() {
	return {
		MAPBOX_API_KEY: SECRET_MAPBOX_API_KEY
	};
}
