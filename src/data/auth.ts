import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Saved with:
// npx playwright codegen --save-storage=playwright/.auth/user.json <BASE_URL>/login
export const authFile = join(__dirname, '../../playwright/.auth/user.json');

export const hasSavedSession = (): boolean => existsSync(authFile);

export const missingSessionMessage =
  'No saved session. Run: npx playwright codegen --save-storage=playwright/.auth/user.json ' +
  '<BASE_URL>/login, sign in, close the browser.';
