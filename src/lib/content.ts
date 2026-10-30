/**
 * Single entry point for site content.
 * Pages and components import from here, never from `astro:content` directly.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { z } from 'astro/zod';
import clubJson from '../../migration/data/club.json';

export type NewsEntry = CollectionEntry<'news'>;
export type NewsCategory = NewsEntry['data']['category'];

export const newsCategoryLabels: Record<NewsCategory, string> = {
  race: 'Gara',
  event: 'Evento',
  notice: 'Comunicazione',
};

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

export async function getNews(): Promise<NewsEntry[]> {
  const entries = await getCollection('news');
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getLatestNews(count = 3): Promise<NewsEntry[]> {
  return (await getNews()).slice(0, count);
}

export async function getCourses() {
  return (await getCollection('courses')).sort(byOrder);
}

export async function getStaff() {
  return (await getCollection('staff')).sort(byOrder);
}

export async function getSponsors() {
  return (await getCollection('sponsors')).sort(byOrder);
}

export async function getLinks() {
  return getCollection('links');
}

/** All albums, newest first. Albums without `externalLink` are shown without a link. */
export async function getAlbums() {
  const albums = await getCollection('albums');
  return albums.sort((a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0));
}

/** Document files are bundled by Vite so they get a hashed public URL. */
const documentFiles = import.meta.glob<string>('../../migration/media/documents/*', {
  query: '?url',
  import: 'default',
  eager: true,
});

export async function getDocuments() {
  const documents = await getCollection('documents');
  return documents
    .map((entry) => {
      const fileName = entry.data.file.split('/').pop() ?? '';
      const url = documentFiles[`../../migration/media/documents/${fileName}`];
      if (!url) throw new Error(`Missing document file: ${entry.data.file}`);
      return { ...entry, url };
    })
    .sort((a, b) => (b.data.year ?? 0) - (a.data.year ?? 0));
}

const clubSchema = z.object({
  name: z.string(),
  legalForm: z.string(),
  founded: z.string(),
  taxCode: z.string().nullable(),
  contacts: z.object({
    email: z.string(),
    domainEmail: z.string(),
    pec: z.string(),
    phone: z.string(),
    contactPerson: z.string(),
    contactRole: z.string(),
  }),
  payments: z.object({ iban: z.string() }),
  venue: z.object({
    name: z.string(),
    address: z.string(),
    city: z.string(),
    mapsUrl: z.url(),
  }),
  openingHours: z.array(z.object({ day: z.string(), from: z.string(), to: z.string() })),
});

export type Club = z.infer<typeof clubSchema>;

export const club: Club = clubSchema.parse(clubJson);

/** `+39 335 534 0183` → `tel:+393355340183` */
export const telHref = (phone: string) => `tel:${phone.replace(/\s+/g, '')}`;
