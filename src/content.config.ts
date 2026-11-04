/**
 * Content collections.
 *
 * Schemas mirror the WordPress content types (docs/content-types.md).
 * With WP_URL set (e.g. https://cms.schermacastelfranco.it), entries come from
 * the WordPress REST API; without it, from `migration/` (offline development).
 * Pages read data through `src/lib/content.ts` and never depend on the source.
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  wordpressAlbums,
  wordpressCourses,
  wordpressDocuments,
  wordpressNews,
  wordpressSponsors,
  wordpressStaff,
} from './lib/wordpress-loader';

const fromWordPress = Boolean(process.env.WP_URL);

const nullableString = z.string().nullable().optional();

const news = defineCollection({
  loader: fromWordPress ? wordpressNews() : glob({ pattern: '*.md', base: './migration/news' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      location: z.string(),
      category: z.enum(['race', 'event', 'notice']),
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Part of the photo kept when it is cropped (WordPress: "Parte da mostrare"). */
      imageFocus: z.enum(['top', 'center', 'bottom']).default('top'),
      results: z
        .array(
          z.object({
            athlete: z.string(),
            category: nullableString,
            placement: nullableString,
          }),
        )
        .optional(),
      originalTitle: z.string().optional(),
      source: z.url().optional(),
    }),
});

const courses = defineCollection({
  loader: fromWordPress ? wordpressCourses() : file('./migration/data/courses.json'),
  schema: z.object({
    title: z.string(),
    weapon: nullableString,
    ageRange: nullableString,
    schedule: nullableString,
    price: nullableString,
    instructor: nullableString,
    description: nullableString,
    order: z.number().default(0),
  }),
});

const staff = defineCollection({
  loader: fromWordPress ? wordpressStaff() : file('./migration/data/staff.json'),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      qualification: nullableString,
      photo: image().nullable().optional(),
      photoAlt: nullableString,
      bio: nullableString,
      order: z.number().default(0),
    }),
});

const documents = defineCollection({
  loader: fromWordPress ? wordpressDocuments() : file('./migration/data/documents.json'),
  schema: z.object({
    title: z.string(),
    year: z.number().nullable(),
    description: nullableString,
    /** Path under migration/media/documents, or an absolute URL (WordPress media). */
    file: z.string(),
    format: z.string(),
    sizeKb: z.number(),
    archived: z.boolean().default(false),
  }),
});

const albums = defineCollection({
  loader: fromWordPress ? wordpressAlbums() : file('./migration/data/albums.json'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date().nullable(),
      cover: image().nullable().optional(),
      coverAlt: z.string().optional(),
      /** Public album (e.g. Google Photos). Null when the old link is dead. */
      externalLink: z.url().nullable(),
    }),
});

const sponsors = defineCollection({
  loader: fromWordPress ? wordpressSponsors() : file('./migration/data/sponsors.json'),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      url: z.url(),
      logo: image(),
      order: z.number().default(0),
    }),
});

const links = defineCollection({
  loader: file('./migration/data/links.json'),
  schema: z.object({
    name: z.string(),
    url: z.url(),
  }),
});

/** Site pages written in Markdown (privacy, accessibility). Not managed in WordPress. */
const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { news, courses, staff, documents, albums, sponsors, links, legal };
