import { test, expect } from './fixtures';
import { loginAsAdmin, waitForHTMX, ADMIN_CREDENTIALS } from './utils/test-helpers';

// These tests require defineUserProfile() to be called in the app entry point
// (my-sonicjs-app/src/user-profile.model.ts). The default demo app ships in
// unconfigured state so the "Profile Information" section is hidden.
// Enable by uncommenting defineUserProfile() in user-profile.model.ts.
