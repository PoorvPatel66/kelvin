import { generateSlug } from '../../src/utils/slugify.js';

describe('generateSlug', () => {
  it('creates SEO-safe slugs', () => {
    expect(generateSlug('Custom Printed Paper Cups & Lids')).toBe('custom-printed-paper-cups-and-lids');
  });

  it('trims duplicate separators', () => {
    expect(generateSlug('  Pizza---Boxes!!!  ')).toBe('pizza-boxes');
  });
});
