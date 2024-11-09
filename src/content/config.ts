import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string(),
    image: image().optional(),
    tags: z.array(z.string()).optional(),
    layout: z.string().optional()
  })
});

export const collections = {
  'blog': blogCollection
}; 