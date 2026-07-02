import { NextResponse } from 'next/server';

// GET /widgets/tracking.js - Cart attribution tracking script for shoppable videos
// This script captures shoppable video attribution params from URLs and injects
// them into Shopify cart attributes so they flow through to order.note_attributes
export async function GET() {
  const script = `
(function() {
  const STORAGE_KEY = 'ssv_attribution';
  const ATTR_VIDEO_ID = '_ssv_video_id';
  const ATTR_VIEWER_ID = '_ssv_viewer_id';

  // Check URL for shoppable video attribution params
  function captureAttributionParams() {
    const url = new URL(window.location.href);
    const ssvid = url.searchParams.get('ssvid');
    const ssvwr = url.searchParams.get('ssvwr');

    if (ssvid && ssvwr) {
      // Store attribution data with timestamp
      const attribution = {
        videoId: ssvid,
        viewerId: ssvwr,
        capturedAt: Date.now(),
        landingPage: window.location.pathname
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
        console.log('[ShoppableVideos] Attribution captured:', attribution);
      } catch (e) {
        console.error('[ShoppableVideos] Failed to store attribution:', e);
      }
    }
  }

  // Get stored attribution (valid for 7 days)
  function getStoredAttribution() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const attribution = JSON.parse(stored);
      const age = Date.now() - attribution.capturedAt;
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (age > maxAge) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return attribution;
    } catch (e) {
      return null;
    }
  }

  // Intercept Shopify cart API calls to add attribution
  function interceptCartAPI() {
    const originalFetch = window.fetch;

    window.fetch = function(url, options) {
      // Check if this is a cart add/update request
      if (typeof url === 'string' && url.includes('/cart/add')) {
        const attribution = getStoredAttribution();

        if (attribution && options && options.body) {
          try {
            let body;

            // Parse the body
            if (typeof options.body === 'string') {
              // Handle JSON body
              try {
                body = JSON.parse(options.body);
              } catch {
                // Handle form-encoded body
                body = Object.fromEntries(new URLSearchParams(options.body));
              }
            } else if (options.body instanceof FormData) {
              // Convert FormData to object
              body = Object.fromEntries(options.body.entries());
            }

            if (body) {
              // Add attribution as cart attributes
              if (!body.attributes) {
                body.attributes = {};
              }
              body.attributes[ATTR_VIDEO_ID] = attribution.videoId;
              body.attributes[ATTR_VIEWER_ID] = attribution.viewerId;

              // Create new options with modified body
              const newOptions = {
                ...options,
                body: JSON.stringify(body),
                headers: {
                  ...options.headers,
                  'Content-Type': 'application/json'
                }
              };

              console.log('[ShoppableVideos] Attribution added to cart:', attribution);
              return originalFetch.call(this, url, newOptions);
            }
          } catch (e) {
            console.error('[ShoppableVideos] Failed to inject attribution:', e);
          }
        }
      }

      return originalFetch.apply(this, arguments);
    };

    // Also intercept XMLHttpRequest for older Shopify themes
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
      this._ssvUrl = url;
      return originalXHROpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(body) {
      if (this._ssvUrl && this._ssvUrl.includes('/cart/add')) {
        const attribution = getStoredAttribution();

        if (attribution && body) {
          try {
            let parsedBody;

            if (typeof body === 'string') {
              try {
                parsedBody = JSON.parse(body);
              } catch {
                parsedBody = Object.fromEntries(new URLSearchParams(body));
              }
            }

            if (parsedBody) {
              if (!parsedBody.attributes) {
                parsedBody.attributes = {};
              }
              parsedBody.attributes[ATTR_VIDEO_ID] = attribution.videoId;
              parsedBody.attributes[ATTR_VIEWER_ID] = attribution.viewerId;

              this.setRequestHeader('Content-Type', 'application/json');
              console.log('[ShoppableVideos] Attribution added to cart (XHR):', attribution);
              return originalXHRSend.call(this, JSON.stringify(parsedBody));
            }
          } catch (e) {
            console.error('[ShoppableVideos] Failed to inject attribution (XHR):', e);
          }
        }
      }

      return originalXHRSend.apply(this, arguments);
    };
  }

  // Also hook into Shopify's native form submission for add to cart
  function interceptFormSubmissions() {
    document.addEventListener('submit', function(e) {
      const form = e.target;
      if (!form || form.tagName !== 'FORM') return;

      const action = form.action || '';
      if (!action.includes('/cart/add')) return;

      const attribution = getStoredAttribution();
      if (!attribution) return;

      // Add hidden inputs for attribution
      const existingVideoInput = form.querySelector('input[name="attributes[' + ATTR_VIDEO_ID + ']"]');
      const existingViewerInput = form.querySelector('input[name="attributes[' + ATTR_VIEWER_ID + ']"]');

      if (!existingVideoInput) {
        const videoInput = document.createElement('input');
        videoInput.type = 'hidden';
        videoInput.name = 'attributes[' + ATTR_VIDEO_ID + ']';
        videoInput.value = attribution.videoId;
        form.appendChild(videoInput);
      }

      if (!existingViewerInput) {
        const viewerInput = document.createElement('input');
        viewerInput.type = 'hidden';
        viewerInput.name = 'attributes[' + ATTR_VIEWER_ID + ']';
        viewerInput.value = attribution.viewerId;
        form.appendChild(viewerInput);
      }

      console.log('[ShoppableVideos] Attribution added to form:', attribution);
    }, true);
  }

  // Initialize
  captureAttributionParams();
  interceptCartAPI();
  interceptFormSubmissions();

  // Expose API for debugging
  window.ShoppableVideosTracking = {
    getAttribution: getStoredAttribution,
    clearAttribution: function() {
      localStorage.removeItem(STORAGE_KEY);
    }
  };
})();
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
