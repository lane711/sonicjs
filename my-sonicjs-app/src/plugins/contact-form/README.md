# Contact Form Plugin for SonicJS

A professional, customizable contact form with Google Maps integration, message storage, and comprehensive admin interface.

## Features

- ✅ **Configurable Company Information**: Customize company name, phone, address, city, and state
- 🗺️ **Google Maps Integration**: Optional embedded Google Maps with your location
- 💾 **Message Storage**: All contact submissions are saved in the database
- 🎨 **Modern UI**: Beautiful, responsive design using Tailwind CSS
- 🔒 **Secure**: Built-in validation and error handling
- 📧 **Email Notifications**: Ready for email integration (coming soon)
- 🎛️ **Admin Dashboard**: Easy configuration through the SonicJS admin panel

## Installation

### 1. Plugin Location

This plugin can be installed in two ways:

**Option A: User Plugin (Current Location)**
```bash
# Plugin is already in: my-sonicjs-app/src/plugins/contact-form/
```

**Option B: Core Plugin (For Distribution)**
```bash
# Move to: packages/core/src/plugins/available/contact-form/
```

### 2. Install the Plugin

The plugin will automatically install when you activate it through the admin interface.

Alternatively, run the migration manually:
```bash
# From my-sonicjs-app directory
npm run db:migrate
```

### 3. Activate the Plugin

1. Start your SonicJS application:
   ```bash
   npm run dev
   ```

2. Navigate to the admin dashboard at `http://localhost:8787/admin`

3. Go to **Plugins** in the sidebar

4. Find **Contact Form** and click **Activate**

## Configuration

### Basic Settings

1. Go to **Admin > Contact Form** in the sidebar
2. Configure your company information:
   - **Company Name**: Your organization name
   - **Phone Number**: Contact phone number
   - **Description**: Optional tagline or description
   - **Street Address**: Physical address
   - **City**: City name
   - **State/Province**: State or region

### Google Maps Setup (Optional)

To display an embedded map on your contact page:

1. **Get a Google Maps API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable **Maps Embed API**
   - Go to **Credentials** and create an API Key
   - Restrict the key to **Maps Embed API** (recommended)

2. **Configure in SonicJS**:
   - Check **Enable Google Map** checkbox
   - Paste your API key in the **Map API Key** field
   - Click **Save Settings**

3. **Test**: Visit `/contact` to see your map embedded

## Usage

### Public Contact Form

Once activated, your contact form is available at:
```
http://localhost:8787/contact
```

Visitors can:
- Fill out name, email, and message
- See your company information and location
- Submit messages that are stored in your database

### Admin Interface

Access the admin interface at:
```
http://localhost:8787/admin/contact-form/settings
```

Features:
- View and update all settings
- Real-time preview of changes
- Secure settings storage

### API Endpoints

The plugin provides these API endpoints:

**Public:**
- `GET /contact` - Display contact form page
- `POST /api/contact` - Submit contact message

**Admin (requires authentication):**
- `GET /api/contact-form/settings` - Get plugin settings
- `POST /api/contact-form/settings` - Update plugin settings
- `GET /api/contact-form/messages` - Get all contact messages

## Database Schema

The plugin uses the existing SonicJS `content` table to store messages:

```sql
-- Messages are stored with:
collection_id: 'contact_messages'
title: 'Message from {name}'
data: JSON with name, email, msg fields
status: 'published'
```

## Development

### File Structure

```
contact-form/
├── index.ts                    # Main plugin file
├── manifest.json               # Plugin metadata
├── README.md                   # This file
├── types.ts                    # TypeScript interfaces
├── components/
│   └── settings-page.ts        # Admin settings UI
├── routes/
│   ├── admin.ts                # Admin API routes
│   └── public.ts               # Public contact form
├── services/
│   └── contact.ts              # Business logic service
├── migrations/
│   └── 001_contact_form_plugin.sql  # Database migration
└── test/
    └── contact.spec.ts         # E2E tests
```

### Running Tests

```bash
# Run all tests
npm run test

# Run E2E tests
npm run e2e

# Run specific test file
npx playwright test src/plugins/contact-form/test/contact.spec.ts
```

### Type Checking

```bash
npm run type-check
```

## Customization

### Styling

The plugin uses Tailwind CSS. To customize:

1. **Public Form**: Edit `routes/public.ts` and modify the HTML/CSS
2. **Admin Settings**: Edit `components/settings-page.ts`

### Adding Email Notifications

To add email notifications when messages are received:

```typescript
// In services/contact.ts, modify saveMessage():
async saveMessage(data: ContactMessage): Promise<void> {
  // ... existing code ...
  
  // Add email notification
  await this.sendEmailNotification(data)
}

private async sendEmailNotification(message: ContactMessage) {
  // Integrate with your email service
  // e.g., SendGrid, AWS SES, etc.
}
```

### Custom Fields

To add custom form fields:

1. Update `types.ts` to add field to `ContactMessage` interface
2. Update `routes/public.ts` to add form field to HTML
3. Update validation in `routes/public.ts`
4. Update storage in `services/contact.ts`

## Troubleshooting

### Map Not Displaying

- ✅ Check that "Enable Google Map" is checked
- ✅ Verify API key is correct
- ✅ Ensure Maps Embed API is enabled in Google Cloud Console
- ✅ Check browser console for any errors

### Messages Not Saving

- ✅ Check that plugin status is "active"
- ✅ Verify database connection
- ✅ Check browser console and server logs for errors

### Settings Not Saving

- ✅ Ensure you're logged in as admin
- ✅ Check that you have `contact_form.manage` permission
- ✅ Verify database connection

## Permissions

The plugin defines these permissions:

- `contact_form.manage` - Manage settings and view messages
- `contact_form.view` - View contact form and messages
- `contact_form.submit` - Submit contact messages

## Support

For issues, questions, or contributions:

- **Documentation**: https://sonicjs.com/plugins/contact-form
- **GitHub Issues**: https://github.com/lane711/sonicjs/issues
- **Discord**: https://discord.gg/sonicjs

## License

MIT License - feel free to use and modify for your projects.

## Changelog

### Version 1.0.0
- Initial release
- Contact form with Google Maps integration
- Admin settings interface
- Message storage in database
- Responsive design
- TypeScript support
