
// dynamic manifest

let manifest = {
  "name": "Codeit",
  "short_name": "Codeit",
  "description": "Mobile code editor connected to Git. Runs on the web, open source, and free.",
  "background_color": "#313744",
  "theme_color": "#313744",
  "display": "standalone",
  "scope": window.location.origin,
  "start_url": window.location.origin + "/full",
  "orientation": "any",
  "icons": [
    {
      "src": window.location.origin + "/icons/android-app-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "capture_links": "existing_client_event",
  "file_handlers": [
    {
      "action": window.location.origin + "/full/?file=true",
      "accept": {
        "text/plain": [".js", ".json", ".html", ".css", ".htm", ".svg", ".ts", ".mjs"]
      }
    }
  ],
  "share_target": {
    "action": window.location.origin + "/full/?file=true",
    "method": "POST",
    "enctype": "text/plain",
    "params": {
      "title": "name",
      "text": "description",
      "url": "link",
      "files": [
        {
          "name": "file",
          "accept": {
            "text/plain": [".js", ".json", ".html", ".css", ".htm", ".svg", ".ts", ".mjs"]
          }
        }
      ]
    }
  },
  "url_handlers": [
    {
      "origin": window.location.origin
    }
  ],
  "display_override": ["window-controls-overlay"]
};


// if not on mobile, display special icons
if (!isMobile) {
  
  if (isMac) {
    
    manifest.icons = [
      {
        "src": window.location.origin + "/icons/mac-icon-512-padding.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any"
      }
    ];
    
  } else {
    
    manifest.icons = [
      {
        "src": window.location.origin + "/icons/app-favicon.png",
        "sizes": "256x256",
        "type": "image/png",
        "purpose": "any"
      }
    ];
    
  }
  
  // change page favicon
  var link = document.querySelector('link[rel*="icon"]');
  link.href = '/icons/app-favicon.png';
  
} else if (!isSafari) {
  
  manifest.background_color = '#0b0d1a';
  
}


function updateManifest() {
  
  let linkElem = document.querySelector('link[rel="manifest"]')
                 || document.createElement('link');
                
  linkElem.setAttribute('rel', 'manifest');
  linkElem.setAttribute('href', 'data:application/json,' + encodeURIComponent(JSON.stringify(manifest)));
  
  if (!linkElem.parentElement) {
    
    document.head.appendChild(linkElem);
    
  }
  
}


// apply dynamic manifest
updateManifest();

