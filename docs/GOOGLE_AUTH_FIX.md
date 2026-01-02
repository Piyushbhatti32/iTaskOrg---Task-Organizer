# Google Auth Fix for Capacitor Android

## ✅ Changes Applied

### 1. Fixed `lib/google-auth.ts` - Mobile sign-in flow
- Changed user cancellation from throwing error to returning `null`
- When `!googleUser?.authentication?.idToken`, now returns `null` instead of throwing

### 2. Fixed `contexts/AuthContext.jsx` - Context handler
- Added null check: `if (result === null) return null;`
- User cancellation is now silent (not an error)
- Only real errors set error state

### 3. Fixed `app/login/page.js` - Handler
- Changed from waiting on useEffect redirect to direct navigation
- Uses `window.location.href = '/tasks'` for WebView compatibility
- Cleaner control flow for mobile apps

---

## 🔥 STEP 4 — Verify Firebase SHA-1 (REQUIRED)

### Get Your SHA-1

Run this command in the `apps/web/android` directory:

```bash
./gradlew signingReport
```

**Expected output (look for this):**
```
Variant: release
Config: release
Store: /Users/.../.android/debug.keystore
Alias: androiddebugkey
MD5: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
SHA-256: ...
```

**Copy the SHA1 value** (the one with colons)

### Add to Firebase Console

1. Go to **Firebase Console**
2. Select your project
3. Go to **Project Settings** → **Your Apps**
4. Select the **Android app** entry
5. Scroll to **"SHA certificate fingerprints"**
6. Click **"Add fingerprint"**
7. Paste the SHA-1 value from above
8. **Save**

---

## 🌐 Verify Web Client ID

### Firebase Console → Authentication

1. Go to **Authentication** → **Sign-in method** → **Google**
2. Make sure it shows your **Web Client ID** (ends with `.apps.googleusercontent.com`)
3. Copy it and verify it matches `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in your `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

---

## 🏗️ Rebuild and Test

```bash
# From workspace root
pnpm --filter web build

# Sync with native
npx cap sync android

# Optional: Open in Android Studio and rebuild
npx cap open android
```

---

## 🧪 Expected Behavior on Android

✅ Tap **"Continue with Google"**
✅ Native Google picker opens (fast, no popup blocking)
✅ User cancels → Stay on login page (no red error)
✅ User selects account → Firebase logs in → Redirect to `/tasks`

---

## 🐛 If Still Failing

1. Check **native console logs** in Android Studio:
   ```
   adb logcat | grep "GoogleAuth\|Firebase"
   ```

2. Check **Web console** in Android Studio Chrome DevTools:
   - Press `F12` in Chrome connected to device
   - Look for exact error message

3. Reply with the **exact error text** (not screenshot) - copy from console

---

## Summary of All Changes

| File | Change |
|------|--------|
| `lib/google-auth.ts` | Return `null` on user cancel, don't throw |
| `contexts/AuthContext.jsx` | Handle `null` return, only error on real failures |
| `app/login/page.js` | Use `window.location.href` for WebView, cleaner flow |

**Status**: Ready for rebuild and test ✅
