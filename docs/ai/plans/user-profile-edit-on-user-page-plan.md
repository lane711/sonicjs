# User Profile Editing on User Edit Page - Implementation Plan

## Overview
Add the ability to view and edit user profile attributes (from the `user_profiles` table) directly on the admin user edit page (`/admin/users/:id/edit`). This integrates the extended profile data (displayName, bio, company, jobTitle, website, location, dateOfBirth) with the existing user management interface.

## Requirements
- [ ] Display user profile fields in a new section on the user edit page
- [ ] Create profile automatically if one doesn't exist when saving
- [ ] Update profile data when saving the user form
- [ ] Show all profile fields: displayName, bio, company, jobTitle, website, location, dateOfBirth
- [ ] Handle case where profile doesn't exist (show empty fields)
- [ ] Maintain existing user edit functionality unchanged

## Technical Approach

### Architecture
The user edit page currently manages core user data (from `users` table). We will extend it to also manage profile data (from `user_profiles` table). This requires:

1. **Backend Changes**:
   - Modify GET `/admin/users/:id/edit` to fetch associated profile data
   - Modify PUT `/admin/users/:id` to create/update profile data

2. **Frontend Changes**:
   - Add a "Profile Information" section to the edit form template
   - Include all profile fields with appropriate input types

### File Changes
| File | Action | Description |
|------|--------|-------------|
| `packages/core/src/routes/admin-users.ts` | Modify | Add profile data fetch in GET, profile update in PUT |
| `packages/core/src/templates/pages/admin-user-edit.template.ts` | Modify | Add Profile Information section with form fields |

### Database Changes
None required - using existing `user_profiles` table structure.

### API Changes
No new endpoints - extending existing endpoints:
- GET `/admin/users/:id/edit` - Now also returns profile data
- PUT `/admin/users/:id` - Now also creates/updates profile

## Implementation Steps

### Step 1: Update UserEditData Interface
Add profile fields to the `UserEditData` interface in `admin-user-edit.template.ts`:
- displayName, bio (already overlaps with users.bio - profile takes precedence), company, jobTitle, website, location, dateOfBirth

### Step 2: Update GET Route to Fetch Profile
In `admin-users.ts`, modify the GET `/admin/users/:id/edit` handler to:
1. Query `user_profiles` table for the user's profile (by user_id)
2. Merge profile data into the response

### Step 3: Update Template with Profile Section
Add a new "Profile Information" section to `admin-user-edit.template.ts` containing:
- Display Name (text input)
- Bio (textarea) - Note: this is separate from users.bio
- Company (text input)
- Job Title (text input)
- Website (url input)
- Location (text input)
- Date of Birth (date input)

### Step 4: Update PUT Route to Save Profile
In `admin-users.ts`, modify the PUT `/admin/users/:id` handler to:
1. Extract profile fields from form data
2. Check if profile exists for user
3. If exists: UPDATE profile
4. If not exists: INSERT new profile with generated ID

## Testing Strategy

### Unit Tests
- Test file: `packages/core/src/routes/admin-users.test.ts` (if exists, or create)
- Test cases:
  - [ ] GET returns user with profile data when profile exists
  - [ ] GET returns user with empty profile fields when profile doesn't exist
  - [ ] PUT creates profile when saving user without existing profile
  - [ ] PUT updates profile when saving user with existing profile
  - [ ] PUT handles all profile fields correctly

### E2E Tests
- Test file: `tests/e2e/14-user-profile-edit.spec.ts`
- Test scenarios:
  - [ ] Admin can view user edit page with profile section
  - [ ] Admin can edit and save profile fields
  - [ ] Profile is created automatically if it doesn't exist
  - [ ] All profile fields are saved correctly
  - [ ] Validation works for URL field (website)

## Design Details

### Profile Section Layout
The new "Profile Information" section will be placed after "Basic Information" and before "Account Status":

```
┌─────────────────────────────────────────────────┐
│ Basic Information                               │
│   First Name, Last Name, Username, Email...    │
├─────────────────────────────────────────────────┤
│ Profile Information (NEW)                       │
│   Display Name, Company, Job Title             │
│   Website, Location, Date of Birth             │
│   Bio (textarea)                               │
├─────────────────────────────────────────────────┤
│ Account Status                                  │
│   Active checkbox, Email Verified checkbox     │
└─────────────────────────────────────────────────┘
```

### Form Field Mapping
| Profile Field | Input Type | Placeholder/Help |
|--------------|------------|------------------|
| displayName | text | "Public display name" |
| company | text | "Company or organization" |
| jobTitle | text | "Job title or role" |
| website | url | "https://example.com" |
| location | text | "City, Country" |
| dateOfBirth | date | (native date picker) |
| bio | textarea | "Short bio or description" |

Note: The `bio` field in user_profiles is separate from the `bio` in the users table. The users table bio is for internal notes, while the profile bio is public-facing.

## Risks & Considerations

1. **Bio field overlap**: Both `users` and `user_profiles` have a `bio` field. Clarify in UI that profile bio is for public display.
   - Mitigation: Label clearly as "Profile Bio" vs "Internal Notes" (existing bio)

2. **Profile creation on first save**: When editing a user without a profile, we auto-create one.
   - Mitigation: Only create if at least one profile field has data

3. **Date handling**: dateOfBirth stored as integer timestamp, needs conversion for date input.
   - Mitigation: Format as YYYY-MM-DD for input, parse back on save

## Questions for Review
- [x] Should the existing `bio` field in the users table be renamed to "Internal Notes" to avoid confusion with profile bio?
  - **Decision**: Remove bio from user table UI entirely. Only use profile bio.
- [x] Should we only create a profile if the user fills in at least one profile field, or always create?
  - **Decision**: Only create profile if at least one profile field has data.

## Approval
- [x] Plan reviewed and approved by user
