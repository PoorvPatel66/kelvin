import { comparePassword, hashPassword } from '../../src/utils/passwordUtils.js';

describe('password utilities', () => {
  it('hashes and verifies passwords with bcrypt', async () => {
    const hash = await hashPassword('StrongPassword@123');

    expect(hash).not.toBe('StrongPassword@123');
    await expect(comparePassword('StrongPassword@123', hash)).resolves.toBe(true);
    await expect(comparePassword('WrongPassword@123', hash)).resolves.toBe(false);
  });
});
