import { jest } from '@jest/globals';

const findSettings = jest.fn();
const findNavigation = jest.fn();

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
  prisma: {
    siteSetting: { findUnique: findSettings },
    navigationItem: { findMany: findNavigation }
  }
}));

const { getPublicSiteSettings } = await import('../../src/controllers/siteSettingsController.js');
const { getPublicNavigation } = await import('../../src/controllers/navigationController.js');

function response() {
  return {
    set: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

function run(handler, res) {
  return new Promise((resolve, reject) => {
    handler({}, res, (error) => error ? reject(error) : resolve());
    setImmediate(resolve);
  });
}

describe('public site configuration controllers', () => {
  beforeEach(() => {
    findSettings.mockReset();
    findNavigation.mockReset();
  });

  it('returns stored shared website settings', async () => {
    const settings = { id: 'primary', siteName: 'Kelvin Eco Products' };
    const res = response();
    findSettings.mockResolvedValue(settings);

    await run(getPublicSiteSettings, res);

    expect(findSettings).toHaveBeenCalledWith({ where: { id: 'primary' } });
    expect(res.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    expect(res.json).toHaveBeenCalledWith({ success: true, settings });
  });

  it('returns only visible navigation in stable display order', async () => {
    const items = [{ id: 'one', label: 'HOME', area: 'HEADER', sortOrder: 10 }];
    const res = response();
    findNavigation.mockResolvedValue(items);

    await run(getPublicNavigation, res);

    expect(findNavigation).toHaveBeenCalledWith({
      where: { isVisible: true },
      orderBy: [{ area: 'asc' }, { sortOrder: 'asc' }, { label: 'asc' }]
    });
    expect(res.json).toHaveBeenCalledWith({ success: true, items });
  });
});
