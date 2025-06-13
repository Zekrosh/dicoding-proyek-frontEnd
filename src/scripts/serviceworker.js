// src/scripts/serviceworker.js
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
} from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { clientsClaim, skipWaiting } from "workbox-core";

skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: "navigations",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
registerRoute(navigationRoute);

registerRoute(
  ({ request, url }) =>
    url.origin === "https://story-api.dicoding.dev" &&
    request.destination === "image",
  new StaleWhileRevalidate({
    cacheName: "dicoding-story-images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ request, url }) =>
    url.origin === "https://story-api.dicoding.dev" && request.method === "GET",
  new NetworkFirst({
    cacheName: "dicoding-story-api-data",
  })
);

registerRoute(
  ({ url }) => url.origin === "https://unpkg.com",
  new CacheFirst({
    cacheName: "leaflet-assets",
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 365 * 24 * 60 * 60 })],
  })
);

registerRoute(
  ({ url }) => url.origin.endsWith("tile.openstreetmap.org"),
  new CacheFirst({
    cacheName: "openstreetmap-tiles",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 150,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

self.addEventListener("push", (event) => {
  let notificationData = {
    title: "Notifikasi Baru",
    options: {
      body: "Ada sesuatu yang baru untuk Anda!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      data: { url: "/" },
    },
  };
  if (event.data) {
    try {
      const dataFromServer = event.data.json();
      notificationData.title = dataFromServer.title;
      notificationData.options.body = dataFromServer.body;
      notificationData.options.icon =
        dataFromServer.icon || notificationData.options.icon;
      notificationData.options.data = { url: dataFromServer.url || "/" };
    } catch (e) {
      console.error("Gagal mem-parsing data push:", e);
    }
  }
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData.options
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data ? event.notification.data.url : "/";
  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      let matchingClient = null;
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url.endsWith(urlToOpen)) {
          matchingClient = windowClient;
          break;
        }
      }
      if (matchingClient) {
        return matchingClient.focus();
      } else {
        return clients.openWindow(urlToOpen);
      }
    });
  event.waitUntil(promiseChain);
});
