import { jest } from '@jest/globals';

const findMany = jest.fn();
const create = jest.fn();
const update = jest.fn();
const remove = jest.fn();

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
  prisma: { exportCountry: { findMany, create, update, delete: remove } }
}));

const {
  createExportCountry,
  deleteExportCountry,
  getExportCountries,
  updateExportCountry
} = await import('../../src/controllers/exportCountryController.js');

function response() {
  return { set: jest.fn().mockReturnThis(), status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
}

function run(handler, req, res) {
  return new Promise((resolve, reject) => {
    handler(req, res, (error) => error ? reject(error) : resolve());
    setImmediate(resolve);
  });
}

describe('export country controllers', () => {
  beforeEach(() => {
    findMany.mockReset();
    create.mockReset();
    update.mockReset();
    remove.mockReset();
  });

  it('returns active public export markets alphabetically', async () => {
    const countries = [{ id: 'one', countryName: 'Canada' }];
    const res = response();
    findMany.mockResolvedValue(countries);
    await run(getExportCountries, { query: {} }, res);
    expect(findMany).toHaveBeenCalledWith({ where: { status: 'ACTIVE' }, orderBy: { countryName: 'asc' } });
    expect(res.json).toHaveBeenCalledWith({ success: true, countries });
  });

  it('creates an export market using only editable fields', async () => {
    const country = { id: 'one', countryName: 'Canada', status: 'ACTIVE' };
    const res = response();
    create.mockResolvedValue(country);
    await run(createExportCountry, { body: { ...country, id: 'ignored', createdAt: 'ignored' } }, res);
    expect(create).toHaveBeenCalledWith({ data: { countryName: 'Canada', status: 'ACTIVE' } });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('updates an existing export market', async () => {
    const country = { id: 'one', countryName: 'Canada', status: 'INACTIVE' };
    const res = response();
    update.mockResolvedValue(country);
    await run(updateExportCountry, { params: { id: 'one' }, body: { status: 'INACTIVE' } }, res);
    expect(update).toHaveBeenCalledWith({ where: { id: 'one' }, data: { status: 'INACTIVE' } });
  });

  it('deletes an export market record', async () => {
    const res = response();
    remove.mockResolvedValue({ id: 'one' });
    await run(deleteExportCountry, { params: { id: 'one' } }, res);
    expect(remove).toHaveBeenCalledWith({ where: { id: 'one' } });
  });
});
