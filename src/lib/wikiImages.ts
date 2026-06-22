// Resolves comedian headshots at runtime from Wikipedia's image API.
//
// Why runtime instead of bundled images: it keeps the repo free of copyrighted
// binaries and always shows the current lead photo. Wikipedia's action API
// supports CORS via `origin=*`, so a plain browser fetch works. Resolved URLs
// are cached in localStorage so a deck only hits the network once.

const CACHE_PREFIX = 'claude-cabo:img:';
const ENDPOINT = 'https://en.wikipedia.org/w/api.php';

function cacheGet(title: string): string | null | undefined {
  const raw = localStorage.getItem(CACHE_PREFIX + title);
  if (raw === null) return undefined; // never fetched
  return raw === '' ? null : raw; // '' = fetched but no image
}

function cacheSet(title: string, url: string | null) {
  localStorage.setItem(CACHE_PREFIX + title, url ?? '');
}

/**
 * Resolve headshot URLs for the given Wikipedia titles.
 * Returns a map of title -> image URL (or null if none found).
 * Cached titles are served instantly; the rest are fetched in one batched call.
 */
export async function resolveHeadshots(
  titles: string[],
  thumbSize = 640,
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};
  const toFetch: string[] = [];

  for (const t of titles) {
    const cached = cacheGet(t);
    if (cached === undefined) toFetch.push(t);
    else result[t] = cached;
  }

  if (toFetch.length === 0) return result;

  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: String(thumbSize),
    redirects: '1',
    titles: toFetch.join('|'),
  });

  try {
    // Guard against a hung request: abort after 8s so the game can start with
    // fallback avatars rather than getting stuck on the loading screen.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let res: Response;
    try {
      res = await fetch(`${ENDPOINT}?${params.toString()}`, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) throw new Error(`wiki ${res.status}`);
    const json = (await res.json()) as WikiQueryResponse;

    // Build mapping from any returned/normalized/redirected title back to the
    // exact title we asked for.
    const aliasToRequested = new Map<string, string>();
    for (const t of toFetch) aliasToRequested.set(t, t);
    for (const n of json.query?.normalized ?? []) {
      const req = aliasToRequested.get(n.from) ?? n.from;
      aliasToRequested.set(n.to, req);
    }
    for (const r of json.query?.redirects ?? []) {
      const req = aliasToRequested.get(r.from) ?? r.from;
      aliasToRequested.set(r.to, req);
    }

    const pages = json.query?.pages ?? {};
    for (const page of Object.values(pages)) {
      const requested = aliasToRequested.get(page.title);
      if (!requested) continue;
      const url = page.thumbnail?.source ?? null;
      result[requested] = url;
      cacheSet(requested, url);
    }

    // Anything we asked for but didn't get back -> cache as missing.
    for (const t of toFetch) {
      if (!(t in result)) {
        result[t] = null;
        cacheSet(t, null);
      }
    }
  } catch {
    // Network/offline: leave un-resolved titles as null (UI falls back to an
    // initials avatar) but do NOT cache, so a later attempt can retry.
    for (const t of toFetch) {
      if (!(t in result)) result[t] = null;
    }
  }

  return result;
}

interface WikiQueryResponse {
  query?: {
    normalized?: { from: string; to: string }[];
    redirects?: { from: string; to: string }[];
    pages?: Record<string, { title: string; thumbnail?: { source: string } }>;
  };
}
