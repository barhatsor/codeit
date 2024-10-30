
// update worker name when updating cached files
const WORKER_NAME = 'codeit-worker-v785';


self.importScripts('/worker/client-channel.js');


let WORKER_CACHE_ENABLED = true;

if (isDev) {
  
  WORKER_CACHE_ENABLED = false;
  
}


// list of files to cache
const FILES_TO_CACHE = [

  '/lib/codeit.js',
  '/lib/prism.js',

  '/lib/plugins/codeit-line-numbers.js',
  '/lib/plugins/codeit-match-braces.js',
  '/lib/plugins/codeit-autolinker.js',
  '/lib/plugins/codeit-autocomplete.js',

  '/full',
  '/full.css',
  
  '/worker/worker-channel.js',

  '/utils.js',
  '/manifest.js',
  '/files.js',
  '/links.js',
  '/repos.js',
  '/git/gitapi.js',
  '/git/gitauth.js',
  '/codedrop.js',
  '/filebrowser.js',
  '/spotlightsearch.js',
  '/localstorage.js',
  '/bottomfloat.js',
  '/context-menu.js',

  '/live-view/live-view.js',
  
  '/live-view/extensions/draggable.js',
  '/live-view/extensions/beautifier.min.js',
  
  '/live-view/extensions/mobile-console/console-sheet.js',
  '/live-view/extensions/mobile-console/logger.js',
  '/live-view/extensions/mobile-console/safari-keyboard.js',
  
  '/live-view/extensions/markdown/marked.min.js',
  '/live-view/extensions/markdown/markdown-dark.css',
  
  '/editor-theme.css',

  '/fonts/fonts.css',

  '/fonts/Mono-Sans/MonoSans-Regular.woff2',
  '/fonts/Mono-Sans/MonoSans-Italic.woff2',
  '/fonts/Mono-Sans/MonoSans-Bold.woff2',
  '/fonts/Mono-Sans/MonoSans-BoldItalic.woff2',

  '/fonts/Inter/Inter-Regular.woff2',
  '/fonts/Inter/Inter-Italic.woff2',
  '/fonts/Inter/Inter-Medium.woff2',
  '/fonts/Inter/Inter-SemiBold.woff2',
  '/fonts/Inter/Inter-SemiBoldItalic.woff2',
  '/fonts/Inter/Inter-Bold.woff2',
  
  '/fonts/Roboto-Mono/RobotoMono-Regular.woff2',
  '/fonts/Roboto-Mono/RobotoMono-Italic.woff2',
  '/fonts/Roboto-Mono/RobotoMono-Bold.woff2',
  '/fonts/Roboto-Mono/RobotoMono-BoldItalic.woff2',

  'https://plausible.io/js/plausible.js',
  
  '/',

  '/icons/android-app-512.png',
  '/icons/iphone-app-180.png',
  '/icons/app-favicon.png',
  '/icons/mac-icon-512-padding.png'

];


// remove previous cached data
caches.keys().then((keyList) => {
  
  return Promise.all(keyList.map((key) => {
    
    if (key !== WORKER_NAME ||
        !WORKER_CACHE_ENABLED) {
      
      return caches.delete(key);
      
    }
    
  }));
  
});

// precache static resources
if (WORKER_CACHE_ENABLED) {
  
  caches.open(WORKER_NAME).then((cache) => {
    
    return cache.addAll(FILES_TO_CACHE);
    
  });
  
}


self.addEventListener('install', (evt) => {
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  self.clients.claim();
});

