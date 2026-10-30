/**
 * Content collections.
 *
 * Schemas mirror the WordPress content types (docs/content-types.md).
 * Until WordPress is live, entries are loaded from `migration/`.
 * To switch source, replace the loaders only: pages read data through
 * `src/lib/content.ts` and never depend on where it comes from.
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const nullableString = z.string().nullable().optional();

const news = defineCollection({
  loader: glob({ pattern: '*.md', base: './migration/news' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      location: z.string(),
      category: z.enum(['race', 'event', 'notice']),
      image: image().optional(),
      imageAlt: z.string().optional(),
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
  loader: file('./migration/data/courses.json'),
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
  loader: file('./migration/data/staff.json'),
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
  loader: file('./migration/data/documents.json'),
  schema: z.object({
    title: z.string(),
    year: z.number().nullable(),
    description: nullableString,
    file: z.string(),
    format: z.string(),
    sizeKb: z.number(),
    archived: z.boolean().default(false),
  }),
});

const albums = defineCollection({
  loader: file('./migration/data/albums.json'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date().nullable(),
      cover: image().nullable().optional(),
      coverAlt: z.string().optional(),
      originalLink: nullableString,
    }),
});

const sponsors = defineCollection({
  loader: file('./migration/data/sponsors.json'),
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

export const collections = { news, courses, staff, documents, albums, sponsors, links };
