# SonicJS API Postman Collection

Comprehensive API testing collection for SonicJS with automated authentication handling.

## Features

- **Automated Authentication**: No need to manually copy/paste tokens
- **Pre-request Auto-login**: Automatically logs in if token is missing or expired
- **Collection Variables**: Stores tokens, IDs, and other test data automatically
- **Comprehensive Coverage**: All major API endpoints included
- **Organized Structure**: Grouped by functional areas

## Quick Start

### 1. Import Collection

1. Open Postman
2. Click **Import** button
3. Select `SonicJS-API.postman_collection.json`
4. (Optional) Import `SonicJS-API.postman_environment.json` for environment variables

### 2. Configure Environment (Optional)

If you imported the environment file:
1. Select "SonicJS Local Environment" from the environment dropdown
2. Update values if needed:
   - `baseUrl`: API base URL (default: `http://localhost:8787`)
   - `testUserEmail`: Login email (default: `admin@test.com`)
   - `testUserPassword`: Login password (default: `Admin123!`)

If you didn't import the environment, the collection will use default values.

### 3. Start Testing

1. **First, seed an admin user** (if not already done):
   - Run: `Authentication > Seed Admin User`
   - This creates the default admin user

2. **Test any endpoint**:
   - Simply run any request
   - Authentication happens automatically
   - Token is saved and reused

## How Auto-Authentication Works

The collection includes a pre-request script that:

1. **Checks token status** before each request
2. **Auto-logs in** if token is missing or expired
3. **Saves token** to collection variables
4. **Reuses token** for subsequent requests

You never need to manually copy tokens or set authorization headers!

## Collection Structure

### Public API
- Health Check
- OpenAPI Specification
- List Collections
- Get Content (with filtering)
- Get Collection Content

### Authentication
- Seed Admin User
- Register User
- Login
- Get Current User
- Refresh Token
- Logout
- Request Password Reset
- Reset Password

### Admin - Content
- List Content (with pagination)
- Create Content
- Get Content by ID
- Update Content
- Duplicate Content
- Get Content Versions
- Restore Content Version
- Bulk Actions
- Delete Content

### Admin - Media
- List Media (with pagination and filtering)
- Upload Media (supports multiple files)
- Get Media by ID
- Update Media Metadata (alt, caption, tags, folder)
- Get Media Stats
- List Media Folders
- Bulk Media Actions (delete, move, tag)
- Delete Media (soft delete)
- Serve Media File (public access)

### Admin - Plugins
- List Plugins
- Get Plugin Settings
- Activate Plugin
- Deactivate Plugin
- Install Plugin
- Uninstall Plugin
- Update Plugin Settings

### Admin - Settings
- Get Migrations Status
- Run Migrations
- Validate Database Schema
- Get All Settings
- Update Settings

## Collection Variables

The collection automatically manages these variables:

| Variable | Description | Auto-populated |
|----------|-------------|----------------|
| `baseUrl` | API base URL | Manual |
| `authToken` | JWT authentication token | Yes (on login) |
| `tokenExpiry` | Token expiration timestamp | Yes (on login) |
| `userId` | Current user ID | Yes (on login) |
| `userEmail` | Current user email | Yes (on login) |
| `testContentId` | Last created content ID | Yes (on create) |
| `testMediaId` | Last uploaded media ID | Yes (on upload) |
| `testPluginId` | Plugin ID for testing | Manual (default: database-tools) |

## Environment Variables (Optional)

Set these in your Postman environment for custom configurations:

| Variable | Description | Default |
|----------|-------------|---------|
| `testUserEmail` | Email for auto-login | admin@test.com |
| `testUserPassword` | Password for auto-login | Admin123! |

## Testing Workflow Examples

### Complete Content Workflow

1. Run: `Authentication > Seed Admin User` (first time only)
2. Run: `Admin - Content > Create Content`
   - Creates content and saves ID to `{{testContentId}}`
3. Run: `Admin - Content > Get Content by ID`
   - Uses saved `{{testContentId}}`
4. Run: `Admin - Content > Update Content`
   - Updates the same content
5. Run: `Admin - Content > Delete Content`
   - Soft deletes the content

### Media Upload & Management

1. Run: `Admin - Media > Upload Media`
   - Upload a file (select file in form-data)
   - Media ID saved to `{{testMediaId}}`
2. Run: `Admin - Media > Update Media Metadata`
   - Updates the uploaded file's metadata
3. Run: `Admin - Media > Get Media Stats`
   - View storage statistics

### Plugin Management

1. Run: `Admin - Plugins > List Plugins`
   - See all available plugins
2. Run: `Admin - Plugins > Activate Plugin`
   - Activates `{{testPluginId}}` (default: database-tools)
3. Run: `Admin - Plugins > Get Plugin Settings`
   - View plugin configuration
4. Run: `Admin - Plugins > Update Plugin Settings`
   - Modify plugin settings

## Tips & Tricks

### Viewing Saved Variables

1. Click **Variables** tab in the collection
2. See all auto-populated values
3. Manually edit if needed

### Clearing Authentication

Run: `Authentication > Logout` to clear saved token

### Testing Different Users

1. Update environment variables `testUserEmail` and `testUserPassword`
2. Run: `Authentication > Logout`
3. Run any protected endpoint (will auto-login with new credentials)

### Debugging Auto-Login

1. Open Postman Console (View > Show Postman Console)
2. Run any request
3. Look for "Auto-login successful!" or error messages

### Running Collections

Use Postman Collection Runner to:
1. Run all requests in sequence
2. Test full workflows
3. Generate test reports

## Request Body Examples

### Register User
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "username": "myusername",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Default Required Fields:**
- `email` (valid email format, minimum 5 characters)
- `password` (minimum 8 characters)
- `username` (minimum 3 characters)
- `firstName` (minimum 1 character)
- `lastName` (minimum 1 character)

**Note:** Registration field requirements are **configurable** in the Authentication System plugin settings. Administrators can:
- Make any field optional/required
- Adjust minimum length requirements
- Add password complexity requirements (uppercase, lowercase, numbers, special characters)
- Configure default user roles

To configure these settings:
1. Navigate to **Admin > Plugins**
2. Click on **Authentication System** plugin
3. Go to **Settings** tab
4. Adjust field requirements as needed

Fields marked as optional in settings can be omitted from registration requests.

### Upload Media
Uses `multipart/form-data`:
- `files` (File or File array) - **Required**
- `folder` (string) - Optional, default: "uploads"
- `alt` (string) - Optional, alt text for images
- `caption` (string) - Optional
- `tags` (string) - Optional, comma-separated

### Update Media Metadata
```json
{
  "alt": "Image description",
  "caption": "Photo caption",
  "tags": ["nature", "landscape"],
  "folder": "gallery"
}
```

All fields are optional. Only included fields will be updated.

## Common Issues

### "Unauthorized" Errors

- Token might be invalid
- Run: `Authentication > Logout` then try again
- Check console for auto-login errors

### "Token expired" Messages

- Should auto-refresh automatically
- If persists, manually run: `Authentication > Refresh Token`

### Variables Not Populating

- Check **Tests** tab in requests for post-response scripts
- Verify response is JSON format
- Check Postman Console for errors

### Validation Errors

If you get validation errors:
1. Check the "Request Body Examples" section above
2. Ensure all required fields are included
3. Verify field formats (email format, minimum lengths, etc.)
4. Check Postman Console for detailed error messages

## API Server Setup

Ensure your SonicJS server is running:

```bash
# Development
npm run dev

# Or with specific port
npm run dev -- --port 8787
```

## Additional Resources

- [SonicJS Documentation](https://github.com/lane711/sonicjs)
- [Postman Learning Center](https://learning.postman.com/)
- [Collection Variables](https://learning.postman.com/docs/sending-requests/variables/)

## Contributing

Found an issue or want to add more tests? Contributions welcome!

1. Add new requests to appropriate folders
2. Include test scripts to save IDs/variables
3. Document in this README
4. Test the full workflow

## License

Same as SonicJS project license.
