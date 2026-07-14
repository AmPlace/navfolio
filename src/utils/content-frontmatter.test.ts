import { describe, expect, test } from 'bun:test';
import { normalizeArticleFrontmatter } from './content-frontmatter';

describe('normalizeArticleFrontmatter', () => {
  test('maps common Hexo aliases to Navfolio fields', () => {
    expect(
      normalizeArticleFrontmatter({
        title: 'Hexo post',
        excerpt: 'Hexo excerpt',
        cover: 'images/cover.webp',
        top: 2,
        tags: 'Astro',
        categories: ['Notes', 2026],
      }),
    ).toEqual({
      title: 'Hexo post',
      excerpt: 'Hexo excerpt',
      cover: 'images/cover.webp',
      top: 2,
      description: 'Hexo excerpt',
      heroImage: '/images/cover.webp',
      sticky: 2,
      tags: ['Astro'],
      categories: ['Notes', '2026'],
      series: [],
    });
  });

  test('ignores false Hexo cover options', () => {
    expect(
      normalizeArticleFrontmatter({
        title: 'No cover',
        description: 'Description',
        cover: false,
        top_img: false,
      }),
    ).toEqual({
      title: 'No cover',
      description: 'Description',
      cover: false,
      top_img: false,
      tags: [],
      categories: [],
      series: [],
    });
  });
});
