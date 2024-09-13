const TRIM_HOST_RE = /^www\./;
const TRIM_URLTEXT_RE = /^\s*(https?:\/\/)?(?:www\.)?/;
const PATH_MAX_LENGTH = 18;

export const toShortUrl = (uri: string): string => {
	try {
		const url = new URL(uri);
		const protocol = url.protocol;

		const host = url.host.replace(TRIM_HOST_RE, '');
		const pathname = url.pathname;

		const path = (pathname === '/' ? '' : pathname) + url.search + url.hash;

		if (protocol === 'http:' || protocol === 'https:') {
			if (path.length > PATH_MAX_LENGTH) {
				return host + path.slice(0, PATH_MAX_LENGTH - 1) + '…';
			}

			return host + path;
		}
	} catch {}

	return uri;
};

const buildHostPart = (url: URL) => {
	const username = url.username;
	// const password = url.password;

	const hostname = url.hostname.replace(TRIM_HOST_RE, '').toLowerCase();
	const port = url.port;

	// const auth = username ? username + (password ? ':' + password : '') + '@' : '';

	// Perhaps might be best if we always warn on authentication being passed.
	const auth = username ? '\0@@\0' : '';
	const host = hostname + (port ? ':' + port : '');

	return auth + host;
};

export const isLinkValid = (uri: string, text: string) => {
	const url = safeUrlParse(uri);

	if (!url) {
		return false;
	}

	const expectedHost = buildHostPart(url);
	const length = expectedHost.length;

	const normalized = text.replace(TRIM_URLTEXT_RE, '').toLowerCase();
	const normalizedLength = normalized.length;

	const boundary = normalizedLength >= length ? normalized[length] : undefined;

	return (
		(!boundary || boundary === '/' || boundary === '?' || boundary === '#') &&
		normalized.startsWith(expectedHost)
	);
};

// Check for the existence of URL.parse and use that if available, removes the
// performance hit from try..catch blocks.
export const safeUrlParse =
	'parse' in URL
		? (text: string): URL | null => {
				const url = URL.parse(text);

				if (url !== null && (url.protocol === 'https:' || url.protocol === 'http:')) {
					return url;
				}

				return null;
			}
		: (text: string): URL | null => {
				try {
					const url = new URL(text);

					if (url.protocol === 'https:' || url.protocol === 'http:') {
						return url;
					}
				} catch {}

				return null;
			};
