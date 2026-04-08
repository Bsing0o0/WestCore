# PWA App Icon Instructions

## Create Your App Icons

You need to create 2 PNG icon files for your Progressive Web App:

### Required Sizes:
1. **192x192 pixels** - For mobile home screen
2. **512x512 pixels** - For high-resolution displays

### How to Create:

**Option 1: Using your Westcore logo**
1. Open your logo in an image editor (Photoshop, GIMP, Canva, etc.)
2. Resize to 512x512 pixels (square)
3. Add padding if needed so logo doesn't touch edges
4. Export as PNG with transparent or solid background
5. Save as `public/images/logos/icon-512.png`
6. Resize to 192x192 pixels
7. Save as `public/images/logos/icon-192.png`

**Option 2: Quick online tools**
- Use https://realfavicongenerator.net/
- Upload your logo
- Select PWA icons
- Download and place in `public/images/logos/`

**Option 3: Placeholder icons (temporary)**
Create solid color squares with your company initials "WC":
- Background: #1a2332 (navy)
- Text: #d4772c (orange)
- Font: Bold, centered

### File Locations:
```
public/
  images/
    logos/
      icon-192.png  ← Create this
      icon-512.png  ← Create this
```

## Testing Your PWA

Once icons are created:

### On Android (Chrome):
1. Open your website on mobile Chrome
2. Tap the menu (⋮) 
3. Select "Install app" or "Add to Home Screen"
4. App will appear on your home screen

### On iOS (Safari):
1. Open your website on Safari
2. Tap the Share button
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"

### Desktop (Chrome/Edge):
1. Visit your website
2. Look for install icon in address bar
3. Click to install as desktop app

## What's Already Done:
✅ manifest.json created
✅ service-worker.js created
✅ PWA meta tags added to all pages
✅ Service worker registration added
✅ Theme colors configured

## What You Need:
❌ Create icon-192.png
❌ Create icon-512.png

Once icons are in place, your website will be a fully installable Progressive Web App!
