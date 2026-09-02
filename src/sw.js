import { precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

clientsClaim()

// self.__WB_MANIFEST is injected by vite-plugin-pwa during build
precacheAndRoute(self.__WB_MANIFEST || [])

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
