# Configurable Authentication Fields

## Overview

User registration fields are now fully configurable through the **Authentication System** plugin settings. Administrators can control which fields are required, set minimum lengths, and add password complexity requirements.

## Features

### 1. Configurable Required Fields

Control which fields are required during user registration:
- **Email** - Email address (with format validation)
- **Password** - User password (with complexity options)
- **Username** - Unique username
- **First Name** - User's first name
- **Last Name** - User's last name

For each field, you can configure:
- **Required** - Whether the field must be provided
- **Minimum Length** - Minimum character count
- **Label** - Display label for the field

### 2. Password Complexity Requirements

Add additional password security requirements:
- **Require Uppercase** - Password must contain A-Z
- **Require Lowercase** - Password must contain a-z
- **Require Numbers** - Password must contain 0-9
- **Require Special Characters** - Password must contain !@#$%^&*

### 3. Registration Settings

General registration behavior:
- **Allow Registration** - Enable/disable public user registration
- **Require Email Verification** - Users must verify email before access
- **Default User Role** - Role assigned to new users (viewer, editor, admin)

### 4. Validation Settings

Additional validation rules:
- **Enforce Email Format** - Validate email address format
- **Prevent Duplicate Usernames** - Ensure unique usernames

## How to Configure

### Via Admin UI

1. Navigate to **Admin Dashboard**
2. Click on **Plugins** in the sidebar
3. Find **Authentication System** plugin
4. Click to open settings
5. Adjust settings in the **Settings** tab
6. Click **Save Settings**

### Default Settings

```json
{
  "requiredFields": {
    "email": { "required": true, "minLength": 5, "label": "Email", "type": "email" },
    "password": { "required": true, "minLength": 8, "label": "Password", "type": "password" },
    "username": { "required": true, "minLength": 3, "label": "Username", "type": "text" },
    "firstName": { "required": true, "minLength": 1, "label": "First Name", "type": "text" },
    "lastName": { "required": true, "minLength": 1, "label": "Last Name", "type": "text" }
  },
  "validation": {
    "emailFormat": true,
    "allowDuplicateUsernames": false,
    "passwordRequirements": {
      "requireUppercase": false,
      "requireLowercase": false,
      "requireNumbers": false,
      "requireSpecialChars": false
    }
  },
  "registration": {
    "enabled": true,
    "requireEmailVerification": false,
    "defaultRole": "viewer"
  }
}
```

## Technical Implementation

### Dynamic Validation

The system uses a dynamic validation schema builder (`AuthValidationService`) that:

1. **Loads settings** from the `core-auth` plugin configuration
2. **Builds Zod schema** dynamically based on settings
3. **Caches validation** for 5 minutes for performance
4. **Auto-generates defaults** for optional fields

### Files Modified

#### New Files Created:
- `src/services/auth-validation.ts` - Dynamic validation service
- `src/templates/components/auth-settings-form.template.ts` - Settings UI component
- `migrations/017_auth_configurable_fields.sql` - Database migration
- `docs/AUTH_CONFIGURABLE_FIELDS.md` - This documentation

#### Modified Files:
- `src/services/plugin-bootstrap.ts` - Added default auth settings
- `src/routes/auth.ts` - Updated registration to use dynamic validation
- `src/routes/admin-plugins.ts` - Clear auth cache on settings update
- `src/templates/pages/admin-plugin-settings.template.ts` - Added auth settings UI
- `tests/postman/README.md` - Documented configurable fields

### API Changes

#### Registration Endpoint: `POST /auth/register`

**Before:**
- All fields always required
- Fixed validation rules
- Hard-coded in Zod schema

**After:**
- Fields configurable via settings
- Dynamic validation based on plugin settings
- Auto-generates defaults for optional fields

**Example with Optional Username:**

```json
// If username is configured as optional
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
// Username will be auto-generated from email: "user"
```

## Auto-Generated Defaults

When fields are marked as optional, the system auto-generates sensible defaults:

| Field | Auto-Generated Value |
|-------|---------------------|
| `username` | Email prefix (before @) or `user_<timestamp>` |
| `firstName` | "User" |
| `lastName` | "" (empty string) |

## Cache Management

- Settings are cached for **5 minutes** for performance
- Cache is automatically cleared when settings are updated
- Cache is invalidated on plugin activation/deactivation

## Validation Errors

When validation fails, detailed error messages are returned:

```json
{
  "error": "Validation failed",
  "details": [
    "Email must be at least 5 characters",
    "Password must contain at least one uppercase letter",
    "Username must be at least 3 characters"
  ]
}
```

## Database Schema

### Users Table

The `users` table schema remains unchanged:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  -- ... other fields
);
```

**Note:** All fields remain `NOT NULL` in the database. Optional fields are filled with auto-generated defaults before insertion.

## Security Considerations

1. **Password Complexity** - Use password requirements for sensitive applications
2. **Email Verification** - Enable for production environments
3. **Default Role** - Set to most restrictive role (viewer) by default
4. **Username Uniqueness** - Always enforce to prevent conflicts

## Migration

To apply the new configurable fields:

```bash
# Run the migration
npm run migrate

# Or manually run:
wrangler d1 execute DB --file=migrations/017_auth_configurable_fields.sql
```

The migration updates the `core-auth` plugin settings with the default configuration.

## Testing

### Postman Collection

The Postman collection has been updated to reflect configurable fields:
- Default values match system defaults
- Documentation explains configurability
- Fields can be removed based on settings

### Testing Different Configurations

1. **Make username optional:**
   - Go to Auth Settings
   - Uncheck "Username" required toggle
   - Test registration without username field

2. **Add password complexity:**
   - Enable "Require Uppercase"
   - Enable "Require Numbers"
   - Test with weak password (should fail)
   - Test with strong password (should succeed)

3. **Adjust minimum lengths:**
   - Set username minLength to 5
   - Test with 3-character username (should fail)
   - Test with 5-character username (should succeed)

## Future Enhancements

Potential future improvements:
- [ ] Add custom field types beyond the 5 defaults
- [ ] Field-level permissions (different requirements per role)
- [ ] Custom validation rules via regex
- [ ] Multi-language field labels
- [ ] Email domain whitelist/blacklist
- [ ] Custom auto-generation patterns

## Support

For issues or questions:
- Check the Postman collection documentation
- Review this technical documentation
- Check console logs for `[AuthValidation]` messages
- Verify plugin settings are saved correctly
