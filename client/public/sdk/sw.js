// ─────────────────────────────────────────────────────────────
// SW.JS  — the Service Worker
// ─────────────────────────────────────────────────────────────
//
// WHAT MAKES THIS FILE SPECIAL?
//
// This is NOT a normal JavaScript file. It runs in its own thread,
// completely separate from the webpage. It has no access to:
//   ❌ document (no DOM)
//   ❌ window
//   ❌ localStorage
//
// But it CAN:
//   ✅ Listen for push events (messages from your server)
//   ✅ Show OS-level notifications
//   ✅ Listen for notification clicks
//   ✅ Run even when the website tab is CLOSED
//
// ANALOGY:
//   The webpage is like a shop that's open during business hours.
//   The service worker is the night security guard — always on duty,
//   even when the shop is closed. When a delivery (push message) arrives
//   at 2am, the security guard (sw.js) signs for it and posts a notice
//   (shows the notification). When the customer arrives next morning
//   and clicks the notice, they're directed to the right place (the link).
//
// LIFECYCLE:
//   1. loader.js calls navigator.serviceWorker.register('sw.js')
//   2. Browser downloads sw.js and fires 'install' event
//   3. Browser fires 'activate' event — SW is now in control
//   4. SW sits idle, waiting for 'push' events from your server
//   5. When a push arrives → 'push' event fires → we show notification
//   6. When user clicks notification → 'notificationclick' event fires
//
// ─────────────────────────────────────────────────────────────

// 'self' in a service worker = the worker itself (equivalent of 'window' in a page)

// ─────────────────────────────────────────────────────────────
// INSTALL EVENT
// ─────────────────────────────────────────────────────────────
// Fires once when the service worker is first downloaded and installed.
// We use skipWaiting() to activate immediately without waiting
// for old tabs using the previous SW version to close.
//
// ANALOGY: New security guard arrives for shift.
//          skipWaiting = "start now, don't wait for the old guard to leave"

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    // waitUntil() keeps the SW alive until the promise resolves.
    // Without it, the browser might terminate the SW mid-install.
    self.skipWaiting() // activate immediately
  );
});

// ─────────────────────────────────────────────────────────────
// ACTIVATE EVENT
// ─────────────────────────────────────────────────────────────
// Fires when this SW takes control (after install + skipWaiting).
// clients.claim() makes this SW immediately control all open tabs
// of the site, not just future ones.
//
// ANALOGY: Security guard clocks in and takes over all doors immediately,
//          not just the ones that open after their shift starts.

self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated ✅');

  event.waitUntil(
    self.clients.claim() // take control of all open tabs immediately
  );
});

// ─────────────────────────────────────────────────────────────
// PUSH EVENT  — the heart of this file
// ─────────────────────────────────────────────────────────────
// Fires when your server sends a push notification to this browser.
//
// HOW DOES THE MESSAGE GET HERE?
//   1. Your backend calls web-push library with the endpoint + keys
//   2. web-push encrypts the payload using the subscriber's p256dh key
//   3. web-push sends it to Google/Mozilla push servers
//   4. Push servers route it to this specific browser
//   5. Browser wakes up this service worker and fires 'push'
//   6. event.data contains your notification payload (decrypted automatically)
//
// WHAT IS THE PAYLOAD?
//   We send JSON with: { title, description, icon, url }
//   The SW reads this and uses it to build the notification.

self.addEventListener('push', (event) => {
  console.log('[SW] Push message received! 📨');

  // ── Parse the payload ─────────────────────────────────────
  // event.data can be null if no payload was sent (just a ping)
  // Always provide a fallback in case parsing fails

  let payload = {
    title:       'New Notification',
    description: 'You have a new message',
    icon:        '/icon.png',
    url:         '/',
  };

  if (event.data) {
    try {
      // event.data.json() parses the raw bytes as JSON
      payload = { ...payload, ...event.data.json() };
      //                        ↑ merge with defaults so missing fields
      //                          don't cause undefined errors
    } catch (err) {
      // If JSON parsing fails, try reading as plain text
      payload.title = event.data.text();
    }
  }

  // ── Build the notification options ───────────────────────
  //
  // These are standard Web Notification API options.
  // The browser/OS uses these to render the notification popup.
  //
  // What it looks like (on desktop):
  // ┌────────────────────────────────────┐
  // │  [icon]  TITLE                     │
  // │          Description text here     │
  // └────────────────────────────────────┘

  const notificationOptions = {
    // body = the description text shown below the title
    body: payload.description,

    // icon = small image shown in the notification
    // Should be at least 192x192px, square, PNG or JPG
    icon: payload.icon || '/icon-192.png',

    // badge = tiny monochrome icon shown in Android status bar
    // (optional, looks good at 72x72px)
    badge: payload.badge || '/badge-72.png',

    // data = custom data we attach to the notification.
    // We can read this in the 'notificationclick' handler below.
    // We store the URL so we know where to navigate on click.
    data: {
      url: payload.url || '/',
    },

    // Actions = buttons shown on the notification (optional)
    // Works on Android, limited support on desktop
    actions: [
      {
        action: 'open',
        title:  'Open',
      },
      {
        action: 'close',
        title:  'Dismiss',
      },
    ],

    // requireInteraction: true means the notification stays visible
    // until the user clicks it (doesn't auto-dismiss after a few seconds)
    requireInteraction: false,

    // timestamp = when the notification was sent
    // Shown as relative time in some OS notification centers
    timestamp: Date.now(),
  };

  // ── Show the notification ─────────────────────────────────
  // self.registration.showNotification() is the actual call that
  // makes the OS popup appear.
  //
  // event.waitUntil() keeps the service worker alive until
  // the notification is shown. Without it, the SW might sleep
  // before the notification appears.

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// ─────────────────────────────────────────────────────────────
// NOTIFICATION CLICK EVENT
// ─────────────────────────────────────────────────────────────
// Fires when the user CLICKS on the notification popup.
//
// We need to:
//   1. Close the notification (remove it from notification center)
//   2. Either focus an already-open tab of the site, OR open a new one
//   3. Navigate to the URL from the notification payload
//
// WHY CHECK FOR EXISTING TABS?
//   If the user already has the website open, it's better to focus
//   that tab and navigate rather than open a whole new tab.
//   UX best practice.

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked!');

  const notification = event.notification;
  const action       = event.action;   // 'open', 'close', or '' (clicked notification body)
  const targetUrl    = notification.data?.url || '/';

  // Close the notification popup immediately
  notification.close();

  // If user clicked the "Dismiss" action button, do nothing more
  if (action === 'close') return;

  // For 'open' action or clicking the notification body itself:
  event.waitUntil(
    // clients.matchAll() gets all open tabs/windows controlled by this SW
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {

        // ── Check if target URL is already open in a tab ──────
        // Loop through all open tabs and look for one showing our URL
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            // Found it! Bring that tab to front instead of opening a new one
            return client.focus();
          }
        }

        // ── No existing tab found → open a new one ────────────
        // clients.openWindow() opens a new browser tab at the URL
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ─────────────────────────────────────────────────────────────
// NOTIFICATION CLOSE EVENT
// ─────────────────────────────────────────────────────────────
// Fires when user dismisses the notification WITHOUT clicking it
// (e.g. swipes it away on Android).
// We just log it — useful for analytics later.

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification dismissed without clicking.');
  // In a production app you might send an analytics event here:
  // "notification was shown but not clicked" → delivery rate tracking
});