if(!self.define){let e,c={};const s=(s,n)=>(s=new URL(s+".js",n).href,c[s]||new Promise((c=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=c,document.head.appendChild(e)}else e=s,importScripts(s),c()})).then((()=>{let e=c[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,i)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(c[a])return;let t={};const r=e=>s(e,a),o={module:{uri:a},exports:t,require:r};c[a]=Promise.all(n.map((e=>o[e]||r(e)))).then((e=>(i(...e),t)))}}define(["./workbox-1bb06f5e"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"5cfee1eb4d4a3391dd9f0b42b384dff8"},{url:"/_next/static/chunks/212-7cb1c1e3be90e10c.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/341.a4c9e4b8dad9832e.js",revision:"a4c9e4b8dad9832e"},{url:"/_next/static/chunks/355-ac048973c4c0dd50.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/361-353a24e1a515b3e0.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/380-ca28ea37f0aaf264.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/397-1c52098e64212929.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/4-cd7589a78ae8be80.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/413-149e2a1fc119e4d2.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/455-6e6c4614dea2cb38.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/472.2c08b965bd9148e2.js",revision:"2c08b965bd9148e2"},{url:"/_next/static/chunks/4bd1b696-5c2af236f646c200.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/514-1f0344194629d70f.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/614-c0476cd2347513ee.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/684-e760a8730f8efd8f.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/75-a153a57131b0b7e0.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/782-189cee15938e6caa.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/966-f342e457cce12835.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/aa35ee89-42629df2b79103eb.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/_not-found/page-c78c2a884f0dcd2a.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/auth/page-be435a718ddea0ed.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/budgets/page-4cf55d4e52ccdf22.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/dashboard/page-91595cab736c4513.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/expenses/page-9037e4630c6d3ada.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/income/page-e7463b854fd98eaa.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/layout-7d83604e87811885.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/loading/page-c00368cc2bf688ca.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/manifest.webmanifest/route-5a1faaa8dedd09cb.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/onboarding/page-431218adb253082c.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/page-02146ea289e23518.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/profile/page-0d96978cd8f1c317.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/reports/page-98572e923c2f6643.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/app/statistics/page-4fde726506bfb28f.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/bc9e92e6-972bd563ad84b6b5.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/framework-52167c1502110d79.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/main-7d2c361ce81dadbb.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/main-app-61ccd533aedb9e30.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/pages/_app-f11d7dc60ecfc8d0.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/pages/_error-8d6419083dc713dc.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-287b7287b2920ff8.js",revision:"e7987cBDze8ocdGqxnGru"},{url:"/_next/static/css/0f21abea311d3074.css",revision:"0f21abea311d3074"},{url:"/_next/static/e7987cBDze8ocdGqxnGru/_buildManifest.js",revision:"c907626d2718c6feda800859c29f77f1"},{url:"/_next/static/e7987cBDze8ocdGqxnGru/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/icons/icon-144x144.svg",revision:"e184760002362cd306704f858329897c"},{url:"/icons/icon-192x192.svg",revision:"d41d8cd98f00b204e9800998ecf8427e"},{url:"/icons/icon-384x384.svg",revision:"0bb3544acfefd701962ba545ea5fc7f3"},{url:"/icons/icon-512x512.svg",revision:"eb1fd10e0ac1b4061d51333c17b842bc"},{url:"/icons/icon-72x72.svg",revision:"77d3e3dd93882b0d4b9ff50731a24c6d"},{url:"/icons/icon-96x96.svg",revision:"475addb734c2dcc23aee7a61bb355491"},{url:"/manifest.json",revision:"6c8861cad75f155f8d782388ae178c8c"},{url:"/placeholder-logo.png",revision:"b7d4c7dd55cf683c956391f9c2ce3f5b"},{url:"/placeholder-logo.svg",revision:"1e16dc7df824652c5906a2ab44aef78c"},{url:"/placeholder-user.jpg",revision:"82c9573f1276f9683ba7d92d8a8c6edd"},{url:"/placeholder.jpg",revision:"887632fd67dd19a0d58abde79d8e2640"},{url:"/placeholder.svg",revision:"35707bd9960ba5281c72af927b79291f"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:c,event:s,state:n})=>c&&"opaqueredirect"===c.type?new Response(c.body,{status:200,statusText:"OK",headers:c.headers}):c}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const c=e.pathname;return!c.startsWith("/api/auth/")&&!!c.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
