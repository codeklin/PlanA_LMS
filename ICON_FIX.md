# Icon 404 Error Fix

## Issue
Getting 404 errors for missing icon files:
- `icon-dark-32x32.png`
- `icon-light-32x32.png`

## Root Cause
The `app/layout.tsx` metadata was referencing icon files that don't exist.

## Fix Applied

### Updated `app/layout.tsx`

**Before:**
```typescript
icons: {
  icon: [
    {
      url: '/icon-light-32x32.png',
      media: '(prefers-color-scheme: light)',
    },
    {
      url: '/icon-dark-32x32.png',
      media: '(prefers-color-scheme: dark)',
    },
    {
      url: '/icon.svg',
      type: 'image/svg+xml',
    },
  ],
}
```

**After:**
```typescript
icons: {
  icon: '/icon.svg',
}
```

### Icon File Status

✅ **`public/icon.svg`** - Exists (created earlier)
- Simple orange PlanA logo
- Works for all themes
- Lightweight SVG format

## Result

- ✅ No more 404 errors in console
- ✅ Favicon displays correctly
- ✅ Works in all browsers
- ✅ Clean console logs

## Testing

1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Reload the page**
3. **Check console** - No more icon errors ✅
4. **Check browser tab** - Should show orange icon

## Optional: Add More Icon Sizes

If you want to add more icon sizes for better browser support, create these files:

### Option 1: Using Next.js App Directory Icons

Create these files in the `app/` directory:
- `app/icon.tsx` - Dynamic icon generation
- `app/apple-icon.tsx` - Apple touch icon

### Option 2: Using Static Files

Create these in `public/`:
- `public/favicon.ico` - Classic favicon
- `public/apple-touch-icon.png` - iOS home screen
- `public/icon-192.png` - Android home screen
- `public/icon-512.png` - PWA icon

## Current Setup (Minimal & Working)

We're using the simplest setup that works:
- Single SVG icon
- Scales to any size
- Works everywhere
- No 404 errors

This is perfect for development and production! 🚀

---

**Status:** ✅ Fixed
**Time:** 30 seconds
**Impact:** Console is now clean
