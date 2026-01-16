# 🎬 RECOMMENDED TEST VIDEOS FOR PR DESCRIPTIONS

Based on analysis of test files and video sizes (larger videos = more user interaction), here are the 2 best videos to showcase each plugin's features:

---

## 1. AI Search Plugin

### Video 1: Admin Configuration & Collection Selection (BEST)
**File**: `/tmp/pr-videos/ai-search-report/data/3c694ec08aea6d9b9d30b0daa91855a514ada156.webm`
- **Size**: 694K (largest = most action)
- **Likely shows**: Admin navigating to AI Search settings, selecting collections for indexing, configuring search options
- **Why this one**: Demonstrates the core admin configuration workflow

### Video 2: Search Functionality in Action
**File**: `/tmp/pr-videos/ai-search-report/data/60636c9ebd6a7c613c25f7a5887b16275944074e.webm`
- **Size**: 687K (second largest)
- **Likely shows**: Actual search queries being executed, real-time results display, semantic search capabilities
- **Why this one**: Shows the end-user experience of AI-powered search

**Alternative picks if these don't show features well:**
- `dc0806dbe49295eccd17088a31583e944cd72213.webm` (676K) - Possibly indexing progress
- `5ad52e1f6b36e7122bed75b003da9f38a865bad9.webm` (669K) - Possibly re-indexing workflow

---

## 2. Contact Form Plugin

### Video 1: Public Form Submission with Map
**File**: `/tmp/pr-videos/contact-form-report/data/5e912e092d5fa1134690870d96c282eae2d0e19a.webm`
- **Size**: 730K (largest = most interaction)
- **Likely shows**: Guest user filling out contact form, Google Maps display, form submission success
- **Why this one**: Showcases the main feature - public-facing contact form

### Video 2: Admin Configuration & Google Maps Setup  
**File**: `/tmp/pr-videos/contact-form-report/data/0255185d43613176eafd068d35b4ed8267be0518.webm`
- **Size**: 729K (second largest)
- **Likely shows**: Admin enabling Google Maps, entering API key, configuring business location
- **Why this one**: Demonstrates the admin setup and Google Maps integration

**Alternative picks if these don't show features well:**
- `4279fa0d3bf4cd35dbaa492d401e0478060728df.webm` (645K) - Possibly submissions dashboard
- `b2d750d0a7b0632a4dacecca4dfbc208457dc128.webm` (637K) - Possibly email notification testing

---

## 3. Turnstile Plugin

### Video 1: Widget Activation & Form Protection
**File**: `/tmp/pr-videos/turnstile-report/data/34228d70add8fb997a520ced66fb394bc3f9d2f0.webm`
- **Size**: 357K (largest = most action)
- **Likely shows**: Turnstile widget appearing on form, challenge completion, form submission with bot protection
- **Why this one**: Shows the core functionality - bot protection in action

### Video 2: Admin Configuration & Settings
**File**: `/tmp/pr-videos/turnstile-report/data/0be4981fcd9a0f92da90c5d9abdd4d0c9dfee312.webm`
- **Size**: 275K (second largest)
- **Likely shows**: Admin configuring Turnstile settings, entering site keys, selecting challenge mode
- **Why this one**: Demonstrates the admin setup process

**Alternative picks if these don't show features well:**
- `b05c7c4a625684627f82d5ab51408e1f2d493aa4.webm` (267K) - Possibly different form scenario
- `9b82d14fecc74f83a370c5e9ae1f218da7ab8e62.webm` (266K) - Possibly error handling

---

## 📋 How to Use These Videos

### Step 1: Preview the Videos
Open each video file to verify it shows the expected features:
```bash
# On Linux with a media player
vlc /tmp/pr-videos/ai-search-report/data/3c694ec08aea6d9b9d30b0daa91855a514ada156.webm
```

### Step 2: Upload to GitHub
1. Create a new GitHub issue or use the PR edit page
2. Drag and drop the video files into the comment/description box
3. GitHub will upload and provide URLs like: `https://github.com/user-attachments/assets/...`

### Step 3: Update PR Descriptions
Replace the placeholders in:
- `AI_SEARCH_PR_FINAL.md` - Replace `[Upload video from...]` with actual URLs
- `TURNSTILE_PR_FINAL.md` - Replace `[Upload video from...]` with actual URLs  
- `CONTACT_FORM_PR_FINAL.md` - Replace `[Upload video from...]` with actual URLs

### Step 4: Video Titles in PR
When embedding, use these titles:

**AI Search:**
- Video 1: "Admin configuration and collection selection"
- Video 2: "Semantic search in action with real-time results"

**Contact Form:**
- Video 1: "Guest submitting contact form with Google Maps"
- Video 2: "Admin enabling Google Maps integration"

**Turnstile:**
- Video 1: "Turnstile widget protecting form submission"
- Video 2: "Admin configuring Turnstile settings"

---

## ⚠️ Important Notes

1. **Preview First**: Always preview videos before uploading to ensure they show the right features
2. **File Sizes**: Larger videos (500K+) typically have more user interaction and are better for demos
3. **Backup Options**: If the recommended videos don't show features well, use the alternative picks listed
4. **Video Quality**: All videos are in WebM format and should play in modern browsers
5. **GitHub Limits**: Each video file must be under 10MB (all these are well under that limit)

---

## 🎯 What Each Video Should Show

### AI Search:
- ✅ Admin navigating to plugin settings
- ✅ Selecting collections to index
- ✅ Indexing progress/status
- ✅ Search query execution
- ✅ Real-time results display

### Contact Form:
- ✅ Public form with all fields
- ✅ Google Maps integration
- ✅ Form submission success
- ✅ Admin configuration panel
- ✅ API key setup

### Turnstile:
- ✅ Widget appearing on form
- ✅ Challenge completion (if visible)
- ✅ Form submission with protection
- ✅ Admin settings page
- ✅ Site key configuration

---

## 📂 Full Video Paths for Copy-Paste

```bash
# AI Search
/tmp/pr-videos/ai-search-report/data/3c694ec08aea6d9b9d30b0daa91855a514ada156.webm
/tmp/pr-videos/ai-search-report/data/60636c9ebd6a7c613c25f7a5887b16275944074e.webm

# Contact Form
/tmp/pr-videos/contact-form-report/data/5e912e092d5fa1134690870d96c282eae2d0e19a.webm
/tmp/pr-videos/contact-form-report/data/0255185d43613176eafd068d35b4ed8267be0518.webm

# Turnstile
/tmp/pr-videos/turnstile-report/data/34228d70add8fb997a520ced66fb394bc3f9d2f0.webm
/tmp/pr-videos/turnstile-report/data/0be4981fcd9a0f92da90c5d9abdd4d0c9dfee312.webm
```

**Total**: 6 videos (2 per plugin) ready to showcase features! 🎉
