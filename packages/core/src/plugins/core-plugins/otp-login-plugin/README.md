# OTP Login Plugin

Passwordless authentication for SonicJS via email one-time codes (OTP). Users sign in by entering a 6-digit code sent to their email - no password required.

## Features

- ✅ **Passwordless**: No passwords to remember or manage
- ✅ **Secure**: Crypto-secure random code generation
- ✅ **Rate Limited**: Prevents abuse (5 requests/hour default)
- ✅ **Brute Force Protection**: Max 3 attempts per code
- ✅ **Auto Expiry**: Codes expire after 10 minutes (configurable)
- ✅ **Mobile Friendly**: Easy to copy/paste codes
- ✅ **Email Integration**: Uses SonicJS email plugin

## API Endpoints

### Request OTP Code
```bash
POST /auth/otp/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify OTP Code
```bash
POST /auth/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

### Resend OTP Code
```bash
POST /auth/otp/resend
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## Configuration

Settings available in Admin → Plugins → OTP Login → Settings:

- **Code Length**: 4-8 digits (default: 6)
- **Code Expiry**: 5-60 minutes (default: 10)
- **Max Attempts**: 3-10 attempts (default: 3)
- **Rate Limit**: 3-20 requests/hour (default: 5)
- **Allow Registration**: Enable new user signup (default: false)

## Security

- Crypto-secure random generation
- One-time use codes
- Time-limited validity
- Rate limiting per email and IP
- Brute force protection
- IP and user agent logging

## Development Mode

In development (`ENVIRONMENT=development`), the API response includes the code:

```json
{
  "message": "Code sent",
  "dev_code": "123456"
}
```

## License

MIT
