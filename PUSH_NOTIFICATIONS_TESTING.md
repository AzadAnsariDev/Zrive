# Push Notifications - Testing Guide

## Quick Start (5 minutes)

### Step 1: Load Dashboard
1. Start the app (both frontend + backend running)
2. Login as a seller
3. Go to `/seller` (Seller Dashboard)
4. **Check header** - should see alarm + notification icons

### Step 2: Enable Push Notifications
1. **Scroll down** to "Push Notifications Enabled" section
2. Browser may ask: **"Allow notifications?"** 
   - Click **"Allow"** ✅
3. Should show: "✅ Push Notifications Enabled"
4. Should show: "Works offline, tab closed, mobile"

### Step 3: Test In-App Alarm (Dashboard Open)
1. Have a test buyer place an order
2. **Keep dashboard open**
3. **New order should trigger:**
   - ✅ Toast notification (in-app message)
   - ✅ 5-second beep sound 🔔
   - ✅ Browser notification popup

### Step 4: Test Offline Alarm (Close Dashboard)
1. **Close the seller dashboard tab** (important!)
2. Have another test buyer place order
3. **Even though tab is closed:**
   - ✅ Browser notification appears on desktop/mobile
   - ✅ No socket connection (tab is closed)
   - ✅ No beep (only audio when dashboard open)
   - ✅ Clicking notification opens dashboard

### Step 5: Test Mute Controls
1. Reopen dashboard
2. Under "In-app Audio Active" → click "Disable"
3. Next order: Toast shows but NO beep
4. Under "Push Notifications Enabled" → click "Disable"
5. Next order: Notification won't show (if browser closed)

---

## Full Test Scenario

### Scenario 1: Seller at Dashboard
```
Timeline:
1. 10:00 - Seller opens dashboard
2. 10:00 - Browser asks for notification permission → Seller clicks "Allow"
3. 10:01 - New order placed
4. Expected: 
   ✅ Toast message appears
   ✅ 5-second beep plays
   ✅ Browser notification shows
   ✅ Badge shows "1" new order
```

### Scenario 2: Seller Closes Tab (CRITICAL TEST)
```
Timeline:
1. 10:00 - Seller had opened dashboard, enabled notifications, then closed tab
2. 10:05 - New order placed (seller NOT on dashboard)
3. Expected:
   ✅ Native notification appears on desktop/mobile
   ✅ Works even if browser was closed
   ✅ No socket connection (socket only works when tab open)
   ✅ Clicking notification → opens dashboard → shows order
```

### Scenario 3: Seller Disabled Alarms
```
Timeline:
1. 10:00 - Seller opens dashboard
2. 10:00 - Disables "In-app Audio Active"
3. 10:00 - Disables "Push Notifications Enabled"
4. 10:01 - New order placed
5. Expected:
   ✅ Toast shows (always)
   ✅ NO beep (audio disabled)
   ✅ NO notification popup (push disabled)
   ✅ Order still appears in dashboard after refresh
```

---

## Verification Checklist

### Browser Notifications Work
- [ ] Permission dialog appears when dashboard loads
- [ ] Settings show "Push Notifications Enabled" after permission granted
- [ ] Notification appears even when tab is closed
- [ ] Clicking notification opens `/seller/orders/{orderId}`
- [ ] Notification shows seller location if available

### Audio Alarm Works
- [ ] 5-second beep plays when dashboard is open
- [ ] Beep is 800 Hz frequency (sine wave)
- [ ] Beep stops after 5 seconds
- [ ] "Disable" button mutes the beep
- [ ] "Enable" button restores beep

### Controls Work
- [ ] Toggle "In-app Audio" switches beep on/off
- [ ] Toggle "Push Notifications" switches notifications
- [ ] Settings persist after page refresh (localStorage)
- [ ] Settings persist after logout/login
- [ ] "Disable" button shows when feature is ON
- [ ] "Enable" button shows when feature is OFF

### Mobile Works
- [ ] Load on mobile browser
- [ ] Notification appears on lock screen
- [ ] Clicking notification opens dashboard
- [ ] Audio plays on mobile (if not muted in OS)
- [ ] Works in Chrome/Firefox/Safari

---

## Debug Console

### Check Service Worker Status
Open DevTools (F12) → Application tab → Service Workers
```
Expected: service-worker.js [ACTIVE]
```

### Check Notification Permission
Open DevTools (F12) → Console, paste:
```javascript
Notification.permission
// Should return: "granted"
```

### Check Service Worker Messages
Open DevTools → Console
```
[Service Worker] Push event received
[Service Worker] Notification shown
```

### Test Notification Manually
Open DevTools → Console:
```javascript
new Notification('Test Alert', {
  body: 'This is a test notification',
  icon: '/zrive-icon-192.png'
})
```

---

## Common Issues & Fixes

### Issue: "Browser permission denied"
**Cause:** Seller clicked "Block" or browser has notifications disabled
**Fix:**
1. Open browser settings (address bar hamburger)
2. Find "Notifications" 
3. Change from "Block" to "Allow"
4. Refresh dashboard

### Issue: Notifications don't appear even when enabled
**Check:**
1. Is permission "granted"? (check DevTools)
2. Are notifications muted in OS?
   - Windows: Check Windows Notifications settings
   - Mac: Check System Preferences → Notifications
   - iOS: Settings → Notifications → [Browser]
3. Is Service Worker active? (check DevTools → Application)

### Issue: Beep sound doesn't play
**Check:**
1. Is browser volume on? (check browser tab audio icon)
2. Is OS volume on?
3. Is "In-app Audio" enabled? (check dashboard)
4. Check DevTools Console for errors: `[useSellerSocket] Error playing alarm`

### Issue: Service Worker not registering
**Cause:** Usually HTTPS requirement
**Fix:**
- Localhost (development) ✅ Works
- HTTP (production) ❌ Fails
- HTTPS (production) ✅ Works
- Self-signed HTTPS ⚠️ May need browser exception

**Check in DevTools → Application → Service Workers**
- Should show: `service-worker.js [ACTIVE]`

---

## Network Scenarios

### Test: Offline Push Notifications
1. Enable push notifications
2. Open DevTools → Network → set to "Offline"
3. Close dashboard tab
4. Have someone place order
5. Expected: Notification STILL appears (queued in browser)

### Test: Slow Connection
1. Open DevTools → Network → set to "Slow 3G"
2. Keep dashboard open
3. New order placed
4. Expected:
   - ✅ Toast might be delayed
   - ✅ Beep and notification still play
   - ✅ Socket reconnects automatically

### Test: Connection Loss & Recovery
1. Close all network (airplane mode)
2. Close dashboard tab
3. Place order (seller is offline)
4. Bring connection back
5. Open dashboard
6. Expected: Order appears in list

---

## Performance Check

Open DevTools → Performance tab:

### Service Worker Registration
- Should take < 500ms
- Check: "registerServiceWorker" time

### Notification Display
- Should be < 100ms
- Check: "showNotification" time
- No jank or lag

### Audio Playback
- Should start immediately
- Check: "playAlarmSound" time
- No audio crackle

---

## Final Checklist Before Production

- [ ] Service Worker registered successfully
- [ ] Notifications work when tab is closed
- [ ] Audio alarm plays for 5 seconds
- [ ] Settings persist after logout
- [ ] Both toggles work independently
- [ ] Works on mobile devices
- [ ] Works offline (notifications still appear)
- [ ] Clicking notification navigates to order
- [ ] No console errors
- [ ] HTTPS enabled (for push on production)
- [ ] Test with real orders (not manual)

---

## Support Commands

### Clear all settings (localStorage)
```javascript
localStorage.clear()
location.reload()
```

### Re-register Service Worker
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister())
  })
}
location.reload()
```

### Check all notifications in browser
DevTools → Application → Notifications (shows received notifications)

---

**Build Status: ✅ COMPLETE AND READY TO TEST**

The system is production-ready. Test following this guide and report any issues!
