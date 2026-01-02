# App Icon & Splash Screen Setup Guide

## ✅ Configuration Complete

The following have been configured:

- ✅ `capacitor.config.ts` — Splash screen settings
- ✅ `app/layout.js` — Meta tags (theme-color, viewport)
- ✅ `app/globals.css` — Background color, scrollbar hiding

---

## 📝 STEP 1 — Prepare Your Assets

You need to create two images in the `resources/` directory:

### Create `resources/icon.png`
- **Size:** 1024 × 1024 px
- **Format:** PNG (square, no rounded corners)
- **Content:** Your app logo/icon
- **Background:** Solid color or transparent (preferably matching your brand: #0F0F14 or white on dark)

### Create `resources/splash.png`
- **Size:** 2732 × 2732 px
- **Format:** PNG
- **Content:** Centered logo on your brand color (#0F0F14)
- **Important:** Leave padding around edges for safe zone

### Directory structure:
```
apps/web/
├── resources/
│   ├── icon.png        (1024×1024)
│   └── splash.png      (2732×2732)
├── android/
├── capacitor.config.ts
└── ...
```

---

## 🔧 STEP 2 — Generate Android Assets

From the `apps/web` directory, run:

```bash
# Generate icons and splash screens
npx cap assets

# Sync changes to Android project
npx cap sync
```

**Expected output:**
```
✔ Generating Android app icons
✔ Android splash screens created
✔ Synced Android project
```

### What it generates:
```
android/app/src/main/res/
├── mipmap-hdpi/ic_launcher.png
├── mipmap-mdpi/ic_launcher.png
├── mipmap-xhdpi/ic_launcher.png
├── mipmap-xxhdpi/ic_launcher.png
├── mipmap-xxxhdpi/ic_launcher.png
└── drawable/splash.xml
```

---

## 🧪 STEP 3 — Test in Android Studio

1. Open Android Studio:
   ```bash
   npx cap open android
   ```

2. Build and run the app:
   - Click ▶ Run or press `Shift + F10`

3. Expected behavior:
   - **Native splash screen** displays for ~1.5 seconds
   - **No white flash** (matches #0F0F14 background)
   - **App icon** is visible on home screen
   - **Smooth transition** into the web app

---

## 📋 Configuration Reference

### `capacitor.config.ts` settings:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 1500,    // Show splash for 1.5 seconds
    launchAutoHide: true,         // Auto-hide when app loads
    backgroundColor: "#0F0F14",   // Matches your dark theme
    androidScaleType: "CENTER_CROP", // Scale image to fill screen
    showSpinner: false,           // No loading spinner
  },
}
```

### Meta tags in `app/layout.js`:

```jsx
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<meta name="theme-color" content="#0F0F14" />
```

**What these do:**
- `initial-scale=1` — Prevents auto-zoom
- `maximum-scale=1` — Disables pinch zoom (native app feel)
- `user-scalable=no` — Mobile app polish
- `theme-color` — Colors address bar (Android)

### CSS in `app/globals.css`:

```css
html, body {
  background-color: #0F0F14;
}

::-webkit-scrollbar {
  display: none;
}

body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

**What these do:**
- Background color matches splash and theme
- Hidden scrollbars = native app feel
- Cross-browser compatible

---

## ⚠️ Important Notes

1. **Image Dimensions:**
   - Icon: Must be square (1024×1024)
   - Splash: Safe dimensions (2732×2732)
   - Capacitor handles all DPI variants

2. **Background Color:**
   - Current: `#0F0F14` (dark theme)
   - Update `backgroundColor` in config if you change theme
   - Keep splash background matching this

3. **Caching:**
   - After running `cap assets`, clear build:
     ```bash
     rm -rf android/app/build
     ```

4. **Testing on Device:**
   - Uninstall old app first
   - Run on actual device for best experience
   - Emulator splash may look slightly different

---

## ✨ Final Checklist

- [ ] Created `resources/icon.png` (1024×1024)
- [ ] Created `resources/splash.png` (2732×2732)
- [ ] Run `npx cap assets` from `apps/web`
- [ ] Run `npx cap sync`
- [ ] Build and run in Android Studio
- [ ] Verified splash displays without white flash
- [ ] Verified launcher icon on home screen
- [ ] Test on real device (if possible)

---

## 🎨 Customization Ideas

### Animated Splash (Advanced)
Replace `splash.png` with animated WebP for splash animation.

### Custom Theme Color
Update `backgroundColor` in config to match your brand:
```typescript
backgroundColor: "#2563eb", // Your primary color
```

### Remove Splash Entirely (Not Recommended)
```typescript
launchShowDuration: 0,    // Show splash for 0ms
launchAutoHide: true,
```

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Splash shows old image | Run `rm -rf android/app/build` and rebuild |
| White flash on load | Check `backgroundColor` matches `globals.css` |
| Icon not updating | Clear app data in device settings |
| Splash stretched | Ensure image is 2732×2732 px |

---

## 📚 Resources

- [Capacitor Assets Docs](https://capacitorjs.com/docs/guides/splash-screens-and-icons)
- [Android Icon Design Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design)
- [Next.js Viewport API](https://nextjs.org/docs/app/api-reference/functions/generate-viewport)

---

**Your app is now configured for professional splash and icon handling!** 🎉
