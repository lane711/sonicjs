# Google Maps API Setup for Forms

The SonicJS Forms system uses Google Maps for the Address field component autocomplete functionality. **Each Address component stores its own API key** in the form schema - this means different users can use their own API keys.

## How It Works

Form.io stores the Google Maps API key **per Address component** in the form's JSON schema under `component.map.key`. This means:

✅ **Per-Component Keys** - Each Address field can have its own API key  
✅ **Multi-User Support** - Different form builders can use their own keys  
✅ **Secure Storage** - Keys are stored in the form schema (database)  
✅ **No Global Configuration** - No need to set environment variables

---

## Quick Start

### 1. Get Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
4. Create credentials → API Key
5. (Optional but recommended) Restrict the API key to your domain

### 2. Add Address Field to Your Form

1. Go to `/admin/forms` and edit or create a form
2. Drag the **Address** component from the **Advanced** tab
3. Click on the Address field to edit it
4. Go to the **Provider** tab
5. In the **Map Settings**, you'll see a field for **API Key**
6. Paste your Google Maps API key there
7. Click **Save**

### 3. Test It

1. Click **Preview** to see the autocomplete in action
2. Or click **View Public Form** to test the live form
3. Start typing an address - Google autocomplete should appear!

---

## Per-Component vs Global Configuration

### ✅ Current Approach (Per-Component - Recommended)

**Pros:**
- Each user can use their own API key
- Different forms can use different keys
- Keys are version-controlled with forms
- More secure (keys are not in environment variables)
- Follows Form.io's standard approach

**How it works:**
```json
{
  "type": "address",
  "label": "Address",
  "key": "address",
  "map": {
    "key": "AIzaSyC...your-key-here"
  }
}
```

### ❌ Global Approach (Not Recommended)

Setting `GOOGLE_MAPS_API_KEY` in `wrangler.toml` would:
- Force all users to use the same key
- Create billing/quota issues
- Make it harder for teams to manage
- Require deployment for key changes

---

## Advanced: Programmatic Setup

If you want to set a default API key for all new Address components, you can:

**Option 1: Set in `wrangler.toml` (Optional Global Fallback)**
```toml
[vars]
GOOGLE_MAPS_API_KEY = "AIzaSyC...your-key"
```

This will be used as a default when creating new Address components, but each component can override it.

**Option 2: Create a Form Template**
Create a reusable form with pre-configured Address fields and duplicate it.

---

## Security Best Practices

### 1. API Key Restrictions

In Google Cloud Console, restrict your API key:

**HTTP Referrers (for production):**
```
https://yourdomain.com/*
https://www.yourdomain.com/*
```

**For Development:**
```
http://localhost:8787/*
http://localhost:*/*
```

### 2. API Quotas

Monitor your usage in Google Cloud Console:
- Free tier: $200 credit per month
- Places API: $17 per 1000 requests (autocomplete)
- Set up billing alerts

### 3. Key Rotation

To rotate keys:
1. Create a new API key in Google Cloud Console
2. Edit each form's Address component
3. Update the API key in the **Provider** tab
4. Delete the old key from Google Cloud Console

---

## Troubleshooting

### "Provider is required" Error
- You haven't set an API key in the Address component
- Edit the component → Provider tab → Add your API key

### "NoApiKeys" or "RefererNotAllowedMapError"
- Your API key has HTTP referer restrictions
- Add your domain to allowed referrers in Google Cloud Console
- For dev: Add `http://localhost:8787/*`

### Autocomplete Not Working
1. Check browser console for errors
2. Verify Places API is enabled in Google Cloud Console
3. Verify your API key is correct
4. Check billing is enabled (Google requires a credit card)

### Address Field Shows But No Autocomplete
- The Google Maps script might not be loading
- Check for the `map.key` property in your form schema
- Open browser dev tools → Network tab → Look for `maps.googleapis.com`

---

## For Developers

### How SonicJS Loads Google Maps

**Form Builder:**
- Checks if Address components exist in the schema
- Extracts `map.key` from each Address component
- Dynamically loads Google Maps script with that key

**Public Forms:**
- Recursively scans the form schema for Address components
- Finds all API keys in `component.map.key`
- Loads Google Maps with the first key found

**Code Location:**
- Builder: `packages/core/src/templates/pages/admin-forms-builder.template.ts`
- Public: `packages/core/src/routes/public-forms.ts`

### Form Schema Example

```json
{
  "components": [
    {
      "type": "address",
      "label": "Shipping Address",
      "key": "shippingAddress",
      "provider": "google",
      "map": {
        "key": "AIzaSyC...your-key",
        "region": "US"
      }
    }
  ]
}
```

---

For more information, see:
- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Form.io Address Component Documentation](https://help.form.io/userguide/forms/form-components#address)
- [Form.io Address Component GitHub Wiki](https://github.com/formio/formio.js/wiki/Address-Component)
