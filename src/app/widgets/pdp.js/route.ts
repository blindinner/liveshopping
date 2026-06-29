import { NextResponse } from 'next/server';

// GET /widgets/pdp.js - Single video widget for product detail pages
export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const script = `
(function() {
  const scripts = document.querySelectorAll('script[data-video-id]');
  const currentScript = scripts[scripts.length - 1];
  const VIDEO_ID = currentScript?.getAttribute('data-video-id');
  const AUTOPLAY = currentScript?.getAttribute('data-autoplay') !== 'false';
  const LOOP = currentScript?.getAttribute('data-loop') !== 'false';
  const WIDTH = currentScript?.getAttribute('data-width') || '100%';
  const MAX_WIDTH = currentScript?.getAttribute('data-max-width') || '400px';
  const BASE_URL = '${baseUrl}';

  if (!VIDEO_ID) {
    console.error('[ShoppableVideos] Missing data-video-id attribute');
    return;
  }

  const styles = document.createElement('style');
  styles.textContent = \`
    .svp-container {
      width: \${WIDTH};
      max-width: \${MAX_WIDTH};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .svp-player {
      position: relative;
      width: 100%;
      aspect-ratio: 9/16;
      background: black;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .svp-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .svp-loading {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1f2937;
    }
    .svp-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: white;
      border-radius: 50%;
      animation: svp-spin 0.8s linear infinite;
    }
    @keyframes svp-spin {
      to { transform: rotate(360deg); }
    }
  \`;
  document.head.appendChild(styles);

  const container = document.createElement('div');
  container.className = 'svp-container';
  container.innerHTML = \`
    <div class="svp-player">
      <div class="svp-loading">
        <div class="svp-spinner"></div>
      </div>
      <iframe
        class="svp-iframe"
        src="\${BASE_URL}/embed/video/\${VIDEO_ID}?autoplay=\${AUTOPLAY}&loop=\${LOOP}"
        allow="autoplay; fullscreen"
        loading="lazy"
        onload="this.previousElementSibling.style.display='none'"
      ></iframe>
    </div>
  \`;

  currentScript.parentNode.insertBefore(container, currentScript.nextSibling);

  window.ShoppableVideosPDP = window.ShoppableVideosPDP || {};
  window.ShoppableVideosPDP[VIDEO_ID] = {
    container,
    play: () => {
      const iframe = container.querySelector('.svp-iframe');
      iframe.contentWindow?.postMessage({ type: 'play' }, '*');
    },
    pause: () => {
      const iframe = container.querySelector('.svp-iframe');
      iframe.contentWindow?.postMessage({ type: 'pause' }, '*');
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
