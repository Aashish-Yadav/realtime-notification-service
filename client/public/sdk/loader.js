// ─────────────────────────────────────────────────────────────
// LOADER.JS  — the script your clients paste on their website
// ─────────────────────────────────────────────────────────────
//
// HOW THE CLIENT USES THIS:
// They add ONE script tag anywhere in their HTML (usually before </body>):
//
//   <script
//     src="https://yourserver.com/sdk/loader.js"
//     data-api-key="their-unique-api-key"
//     data-server="https://yourserver.com"
//   ></script>
//
// That's ALL the client has to do. This file does everything else.
//
// ─────────────────────────────────────────────────────────────
//
// FULL FLOW (what this file does step by step):
//
//  1. Read the api-key and server URL from the script tag's attributes
//  2. Check if this browser supports push notifications
//  3. Register sw.js as a Service Worker
//  4. Ask the user "Allow notifications?"
//  5. If allowed → get the push subscription object from the browser
//  6. Send that subscription + api-key + domain to YOUR backend
//  7. Backend saves it → site is now registered, subscriber is saved
//
// ─────────────────────────────────────────────────────────────

(function () {
  // ── IIFE (Immediately Invoked Function Expression) ──────────
  // We wrap everything in (function(){ ... })()
  // This means it runs immediately AND all variables are private.
  // They won't leak into the client's website and cause conflicts.
  // ANALOGY: Doing your work in a closed room so you don't mess
  //          up anyone else's desk.

  // ── Step 1: Read configuration from the script tag ─────────
  //
  // When the browser parses <script src="loader.js" data-api-key="abc">,
  // it sets document.currentScript to that <script> element.
  // We can read the data- attributes from it.
  //
  // WHY data- attributes?
  // It's the standard HTML way to attach custom data to elements.
  // data-api-key="abc" → element.dataset.apiKey === "abc"
  // (HTML auto-converts kebab-case to camelCase in .dataset)

  const scriptTag  = document.currentScript;
  const API_KEY    = scriptTag.getAttribute('data-api-key');
  const SERVER_URL = scriptTag.getAttribute('data-server') || 'http://localhost:5000';

  // ── Validate: API key is required ──────────────────────────
  if (!API_KEY) {
    console.warn('[PushNotify] Missing data-api-key on script tag. Aborting.');
    return; // stop execution, nothing to do without an API key
  }

  // ── Step 2: Check browser support ──────────────────────────
  //
  // Not all browsers support every feature we need.
  // We need THREE things to all be available:
  //
  //   'serviceWorker' in navigator
  //     → the browser can run background scripts (sw.js)
  //
  //   'PushManager' in window
  //     → the browser has the push notification API
  //
  //   'Notification' in window
  //     → the browser can show OS-level notification popups
  //
  // If any of these is missing (old browser, or the page is served
  // over HTTP instead of HTTPS), we quietly stop.
  //
  // NOTE: Push notifications ONLY work on HTTPS.
  //       On HTTP, the browser blocks service workers entirely.
  //       Exception: localhost (for development).

  if (
    !('serviceWorker' in navigator) ||
    !('PushManager' in window) ||
    !('Notification' in window)
  ) {
    console.warn('[PushNotify] This browser does not support push notifications.');
    return;
  }

  // ── Step 3: Main initialization ────────────────────────────
  // We wait for the page to fully load before doing anything,
  // so we don't slow down the client's website rendering.
  // 'load' fires after ALL resources (images, scripts) are loaded.

  window.addEventListener('load', async () => {
    try {
      await initPushNotifications();
    } catch (err) {
      // Silent fail — we never want to break the client's site
      console.error('[PushNotify] Initialization error:', err);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // MAIN FUNCTION
  // ─────────────────────────────────────────────────────────────

  async function initPushNotifications() {

    // ── Step 3a: Register the Service Worker ─────────────────
    //
    // navigator.serviceWorker.register() tells the browser:
    // "Please download this file and run it as a background worker."
    //
    // The browser downloads sw.js, installs it, and activates it.
    // After this, sw.js is alive and listening for push events —
    // even when this page is closed!
    //
    // 'registration' is an object we use to interact with the SW.
    // We need it in the next step to create a push subscription.

    // ✅ AFTER
const swUrl = `${window.location.origin}/sw.js`;
const registration = await navigator.serviceWorker.register(swUrl, {
  scope: '/',
});

    console.log('[PushNotify] Service Worker registered ✅');

    // ── Step 3b: Check existing permission ───────────────────
    //
    // Notification.permission can be:
    //   'default'  → user hasn't been asked yet (show the prompt)
    //   'granted'  → user already said yes (just re-subscribe silently)
    //   'denied'   → user said no (respect it, never ask again)
    //
    // WHY check this?
    // If someone visits the site a second time, we don't want to
    // spam them with another permission request. We just silently
    // re-subscribe using their existing permission.

    if (Notification.permission === 'denied') {
      console.log('[PushNotify] Notifications are blocked by the user.');
      return;
    }

    // ── Step 3c: Get the VAPID public key ─────────────────────
    //
    // Before subscribing, we need your server's VAPID public key.
    // This is fetched from your API so clients don't hardcode it
    // in the script tag (easier to rotate if needed).
    //
    // The VAPID public key is NOT a secret — it's meant to be public.
    // It's used by the browser to "lock" subscriptions so only your
    // server (which has the private key) can send to them.

    const vapidResponse = await fetch(`${SERVER_URL}/api/subscribe/vapid-public-key`);
    const { publicKey } = await vapidResponse.json();

    // ── Step 3d: Request permission + get subscription ────────
    //
    // pushManager.subscribe() does TWO things at once:
    //   1. Shows the "Allow notifications?" popup (if not already answered)
    //   2. Contacts Google/Mozilla push servers and gets a subscription object
    //
    // userVisibleOnly: true is REQUIRED by browsers.
    // It means "every push message must show a visible notification to the user."
    // Browsers don't allow silent background pushes (privacy protection).
    //
    // applicationServerKey: our VAPID public key, converted to Uint8Array format
    // (browsers require this specific format — urlBase64ToUint8Array handles it)

    let subscription;
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    } catch (err) {
      // This error fires if the user clicks "Block" on the prompt
      // or if they've already blocked notifications in browser settings
      if (Notification.permission === 'denied') {
        console.log('[PushNotify] User denied the notification permission.');
      } else {
        console.error('[PushNotify] Subscription failed:', err);
      }
      return;
    }

    // At this point, 'subscription' looks like:
    // {
    //   endpoint: "https://fcm.googleapis.com/fcm/send/abc123...",
    //   keys: {
    //     p256dh: "BNcRdreALRFXTkOOUHK1...",
    //     auth:   "tAx8ANkQJ3y2..."
    //   }
    // }
    // This is the "PO Box address" we talked about earlier.
    // We now send this to our backend to store.

    console.log('[PushNotify] User subscribed ✅');

    // ── Step 3e: Send subscription to your backend ────────────
    //
    // We POST 4 things:
    //   1. The subscription object (endpoint + keys)
    //   2. The API key (tells us WHICH SaaS user this belongs to)
    //   3. The domain (so we can auto-create/find the Site record)
    //   4. The site name (human-readable label for the dashboard)

    const response = await fetch(`${SERVER_URL}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription:  subscription.toJSON(), // converts to plain object
        apiKey:        API_KEY,
        domain:        window.location.hostname,
        siteName:      document.title || window.location.hostname,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('[PushNotify] Subscription saved to server ✅');
    } else {
      console.warn('[PushNotify] Server rejected subscription:', result.message);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // HELPER: Convert VAPID public key from Base64 string to Uint8Array
  // ─────────────────────────────────────────────────────────────
  //
  // WHY IS THIS NEEDED?
  // The VAPID key is stored/transmitted as a Base64 string (text).
  // But the browser's pushManager.subscribe() requires it as raw bytes (Uint8Array).
  //
  // This function converts between the two formats.
  // ANALOGY: Like converting a phone number from "1-800-FLOWERS" to "1-800-356-9377"
  //          Same information, different format required by the system.
  //
  // You don't need to fully understand the bit-shifting math here —
  // it's standard boilerplate used in every Web Push implementation.

  function urlBase64ToUint8Array(base64String) {
    // URL-safe Base64 uses - and _ instead of + and /
    // We convert back to standard Base64 before decoding
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData     = window.atob(base64);           // decode Base64 to binary string
    const outputArray = new Uint8Array(rawData.length); // create a byte array

    // Copy each character's char code (= byte value) into the array
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

})(); // end of IIFE — runs immediately