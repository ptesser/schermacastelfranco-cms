/**
 * Astro content loaders that read the WordPress REST API at build time.
 *
 * Used when WP_URL is set (see content.config.ts). Only published content is
 * public in the REST API, so drafts never reach the site. Featured images are
 * downloaded into `.wp-cache/media/` so Astro can optimise them like local files.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Loader, LoaderContext } from 'astro/loaders';

const CACHE_DIR = '.wp-cache';
/** Entries point at this file (relative to the project root) so `./media/x.jpg` resolves into the cache. */
const ENTRY_FILE = `${CACHE_DIR}/entries.json`;
let root = process.cwd();

type Rendered = { rendered: string };

interface WpMedia {
  id: number;
  source_url: string;
  alt_text: string;
  mime_type: string;
  media_details?: { filesize?: number };
}

interface WpItem {
  id: number;
  slug: string;
  date: string;
  menu_order?: number;
  title: Rendered;
  content?: Rendered;
  excerpt?: Rendered;
  categories?: number[];
  acf?: Record<string, unknown>;
  _embedded?: {
    'wp:featuredmedia'?: WpMedia[];
    'wp:term'?: { taxonomy: string; slug: string }[][];
  };
}

const MAX_CONCURRENT = 4;
const RETRY_DELAYS = [2000, 5000, 10000];
let active = 0;
const waiting: (() => void)[] = [];

/**
 * fetch() with a small concurrency cap and retries: the shared hosting may
 * refuse bursts of connections (all collections load in parallel).
 */
async function request(url: string): Promise<Response> {
  if (active >= MAX_CONCURRENT) await new Promise<void>((resolve) => waiting.push(resolve));
  active++;
  try {
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
        if (response.status < 500 || attempt >= RETRY_DELAYS.length) return response;
      } catch (error) {
        if (attempt >= RETRY_DELAYS.length) throw new Error(`WordPress unreachable: ${url}`, { cause: error });
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }
  } finally {
    active--;
    waiting.shift()?.();
  }
}

/** All pages of a REST collection. */
async function fetchAll<T>(baseUrl: string, route: string, query = ''): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1, totalPages = 1; page <= totalPages; page++) {
    const url = `${baseUrl}/wp-json/wp/v2/${route}?per_page=100&page=${page}${query}`;
    const response = await request(url);
    if (!response.ok) throw new Error(`WordPress ${response.status} for ${url}`);
    totalPages = Number(response.headers.get('X-WP-TotalPages') ?? 1);
    items.push(...((await response.json()) as T[]));
  }
  return items;
}

async function fetchMedia(baseUrl: string, id: number): Promise<WpMedia | null> {
  const response = await request(`${baseUrl}/wp-json/wp/v2/media/${id}`);
  return response.ok ? ((await response.json()) as WpMedia) : null;
}

/** Downloads an image once into the cache; returns a path relative to ENTRY_FILE. */
async function cacheImage(url: string): Promise<string> {
  const name = `${createHash('sha1').update(url).digest('hex').slice(0, 10)}-${path.basename(new URL(url).pathname)}`;
  const mediaDir = path.join(root, CACHE_DIR, 'media');
  const target = path.join(mediaDir, name);
  if (!existsSync(target)) {
    const response = await request(url);
    if (!response.ok) throw new Error(`Image ${response.status}: ${url}`);
    await mkdir(mediaDir, { recursive: true });
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
  }
  return `./media/${name}`;
}

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** WordPress returns titles HTML-encoded (e.g. `&#8217;`). */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const value = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isNaN(value) ? match : String.fromCodePoint(value);
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

export function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/** ACF date pickers store `Ymd` (e.g. 20170609); the REST API returns it as is. */
export function acfDate(value: unknown): string | null {
  const raw = text(value);
  const match = raw?.match(/^(\d{4})-?(\d{2})-?(\d{2})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

const text = (value: unknown): string | null => (typeof value === 'string' && value.trim() !== '' ? value.trim() : null);

async function featuredImage(item: WpItem): Promise<{ src: string; alt: string } | null> {
  const media = item._embedded?.['wp:featuredmedia']?.[0];
  if (!media?.source_url) return null;
  return { src: await cacheImage(media.source_url), alt: media.alt_text ?? '' };
}

type Mapper = (item: WpItem, baseUrl: string) => Promise<Record<string, unknown>>;

function wordpressLoader(name: string, route: string, map: Mapper, options: { embed?: boolean; rendered?: boolean } = {}): Loader {
  return {
    name: `wordpress-${name}`,
    async load({ store, parseData, logger, config }: LoaderContext) {
      const baseUrl = process.env.WP_URL!.replace(/\/$/, '');
      root = fileURLToPath(config.root);
      const entryFile = path.join(root, ENTRY_FILE);
      if (!existsSync(entryFile)) {
        await mkdir(path.dirname(entryFile), { recursive: true });
        await writeFile(entryFile, '{}\n');
      }
      const items = await fetchAll<WpItem>(baseUrl, route, options.embed ? '&_embed=wp:featuredmedia,wp:term' : '');
      store.clear();
      for (const item of items) {
        const data = await parseData({ id: item.slug, data: await map(item, baseUrl), filePath: ENTRY_FILE });
        store.set({
          id: item.slug,
          data,
          filePath: ENTRY_FILE,
          ...(options.rendered && item.content
            ? { body: stripHtml(item.content.rendered), rendered: { html: item.content.rendered } }
            : {}),
        });
      }
      logger.info(`${items.length} ${name} from ${baseUrl}`);
    },
  };
}

const NEWS_CATEGORIES = ['race', 'event', 'notice'];

/** "Nome Cognome | Categoria | Piazzamento" per line. */
function parseResults(value: unknown) {
  const lines = (text(value) ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
  return lines.map((line) => {
    const [athlete, category, placement] = line.split('|').map((part) => part.trim());
    return { athlete, category: category || null, placement: placement || null };
  });
}

export const wordpressNews = () =>
  wordpressLoader(
    'news',
    'posts',
    async (item) => {
      const image = await featuredImage(item);
      const slugs = item._embedded?.['wp:term']?.flat().filter((term) => term.taxonomy === 'category').map((term) => term.slug) ?? [];
      const results = parseResults(item.acf?.results);
      return {
        title: decodeEntities(item.title.rendered),
        date: item.date,
        location: text(item.acf?.location) ?? '',
        category: slugs.find((slug) => NEWS_CATEGORIES.includes(slug)) ?? 'notice',
        ...(image ? { image: image.src, imageAlt: image.alt } : {}),
        imageFocus: text(item.acf?.image_focus) ?? 'top',
        ...(results.length > 0 ? { results } : {}),
      };
    },
    { embed: true, rendered: true },
  );

export const wordpressCourses = () =>
  wordpressLoader('courses', 'courses', async (item) => ({
    title: decodeEntities(item.title.rendered),
    weapon: text(item.acf?.weapon),
    ageRange: text(item.acf?.age_range),
    schedule: text(item.acf?.schedule),
    price: text(item.acf?.price),
    instructor: text(item.acf?.instructor),
    description: text(stripHtml(item.content?.rendered ?? '')),
    order: item.menu_order ?? 0,
  }));

export const wordpressStaff = () =>
  wordpressLoader(
    'staff',
    'staff',
    async (item) => {
      const image = await featuredImage(item);
      return {
        name: decodeEntities(item.title.rendered),
        role: text(item.acf?.role) ?? '',
        qualification: text(item.acf?.qualification),
        photo: image?.src ?? null,
        photoAlt: image?.alt ?? null,
        bio: text(stripHtml(item.content?.rendered ?? '')),
        order: item.menu_order ?? 0,
      };
    },
    { embed: true },
  );

export const wordpressDocuments = () =>
  wordpressLoader('documents', 'documents', async (item, baseUrl) => {
    const fileId = Number(item.acf?.file);
    const media = fileId ? await fetchMedia(baseUrl, fileId) : null;
    if (!media) throw new Error(`Document "${item.slug}" has no file`);
    const extension = path.extname(new URL(media.source_url).pathname).slice(1).toUpperCase();
    const year = Number(item.acf?.year);
    return {
      title: decodeEntities(item.title.rendered),
      year: year || null,
      description: text(stripHtml(item.excerpt?.rendered ?? '')),
      file: media.source_url,
      format: extension || 'File',
      sizeKb: Math.max(1, Math.round((media.media_details?.filesize ?? 0) / 1024)),
      archived: Boolean(item.acf?.archived),
    };
  });

export const wordpressAlbums = () =>
  wordpressLoader(
    'albums',
    'albums',
    async (item) => {
      const image = await featuredImage(item);
      return {
        title: decodeEntities(item.title.rendered),
        date: acfDate(item.acf?.date),
        cover: image?.src ?? null,
        coverAlt: image?.alt ?? '',
        externalLink: text(item.acf?.external_link),
      };
    },
    { embed: true },
  );

export const wordpressSponsors = () =>
  wordpressLoader(
    'sponsors',
    'sponsors',
    async (item) => {
      const image = await featuredImage(item);
      if (!image) throw new Error(`Sponsor "${item.slug}" has no logo`);
      return {
        name: decodeEntities(item.title.rendered),
        url: text(item.acf?.url) ?? '',
        logo: image.src,
        order: item.menu_order ?? 0,
      };
    },
    { embed: true },
  );
