# Contact Form Plugin for SonicJS

A simple, configurable contact form with Google Maps integration.

## Features
- Customizable Company Name, Phone, and Address.
- Google Maps Embed (Requires API Key).
- Message storage in SonicJS `content` table.
- Admin Interface for easy configuration.

## Setup
1. **Install:** Place this folder in `src/plugins/contact-form`.
2. **Activate:** Go to the Admin Dashboard > Plugins and click "Activate".
3. **Configure:**
   - Go to the Plugin Settings page.
   - Enter your company details.
   - **Maps:** To use the map, you must generate a Google Maps Embed API Key.
     1. Go to Google Cloud Console.
     2. Enable "Maps Embed API".
     3. Create a Credential (API Key).
     4. Paste the key into the settings field.

## Developer Notes
- Run tests: `npx playwright test src/plugins/contact-form/test/contact.spec.ts`
