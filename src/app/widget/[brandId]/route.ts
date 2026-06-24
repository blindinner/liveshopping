import { NextResponse } from 'next/server';

// GET /widget/[brandId] - Returns the embeddable widget script
export async function GET(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const script = `
(function() {
  const BRAND_ID = '${brandId}';
  const BASE_URL = '${baseUrl}';
  const CHECK_INTERVAL = 30000;

  let currentMode = 'hidden'; // 'hidden' | 'bubble' | 'modal' | 'mini'
  let bubbleElement = null;
  let modalElement = null;
  let miniElement = null;

  const t = {
    live: 'LIVE',
    close: 'Close',
    minimize: 'Minimize',
    maximize: 'Maximize'
  };

  // Create styles
  const styles = document.createElement('style');
  styles.textContent = \`
    @keyframes ls-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    @keyframes ls-ripple {
      0% { transform: scale(1); opacity: 0.4; }
      100% { transform: scale(2); opacity: 0; }
    }
    @keyframes ls-slideIn {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes ls-fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Bubble styles */
    .ls-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      cursor: pointer;
      animation: ls-slideIn 0.4s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .ls-bubble-inner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 50px;
      box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .ls-bubble:hover .ls-bubble-inner {
      transform: scale(1.05);
      box-shadow: 0 6px 28px rgba(236, 72, 153, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .ls-live-dot {
      position: relative;
      width: 12px;
      height: 12px;
    }
    .ls-live-dot::before {
      content: '';
      position: absolute;
      inset: 0;
      background: white;
      border-radius: 50%;
      animation: ls-pulse 1.5s ease-in-out infinite;
    }
    .ls-live-dot::after {
      content: '';
      position: absolute;
      inset: -4px;
      border: 2px solid white;
      border-radius: 50%;
      animation: ls-ripple 1.5s ease-out infinite;
    }
    .ls-live-text {
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.5px;
    }

    /* Modal styles */
    .ls-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 9999999;
      animation: ls-fadeIn 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .ls-modal-container {
      position: relative;
      width: 100%;
      max-width: 450px;
      aspect-ratio: 9/16;
      max-height: 90vh;
      background: black;
      border-radius: 16px;
      overflow: hidden;
      animation: ls-slideIn 0.4s ease-out;
    }
    .ls-modal-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .ls-modal-controls {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 10;
    }
    .ls-modal-btn {
      width: 36px;
      height: 36px;
      background: rgba(0, 0, 0, 0.6);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .ls-modal-btn:hover {
      background: rgba(0, 0, 0, 0.8);
    }
    .ls-modal-btn svg {
      width: 18px;
      height: 18px;
    }

    /* Miniplayer styles */
    .ls-mini {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999999;
      width: 180px;
      height: 320px;
      background: black;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
      animation: ls-slideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .ls-mini-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .ls-mini-controls {
      position: absolute;
      top: 8px;
      left: 8px;
      display: flex;
      gap: 6px;
      z-index: 10;
    }
    .ls-mini-btn {
      width: 28px;
      height: 28px;
      background: rgba(0, 0, 0, 0.6);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .ls-mini-btn:hover {
      background: rgba(0, 0, 0, 0.8);
    }
    .ls-mini-btn svg {
      width: 14px;
      height: 14px;
    }
    .ls-mini-live {
      position: absolute;
      top: 8px;
      left: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      background: #ef4444;
      padding: 4px 8px;
      border-radius: 4px;
      z-index: 10;
    }
    .ls-mini-live-dot {
      width: 6px;
      height: 6px;
      background: white;
      border-radius: 50%;
      animation: ls-pulse 1.5s ease-in-out infinite;
    }
    .ls-mini-live-text {
      color: white;
      font-size: 10px;
      font-weight: 700;
    }

    @media (max-width: 480px) {
      .ls-bubble {
        bottom: 16px;
        right: 16px;
      }
      .ls-bubble-inner {
        padding: 10px 16px;
      }
      .ls-modal-container {
        max-width: 100%;
        max-height: 100%;
        border-radius: 0;
      }
      .ls-modal-overlay {
        padding: 0;
      }
      .ls-mini {
        bottom: 16px;
        right: 16px;
        width: 140px;
        height: 250px;
      }
    }
  \`;
  document.head.appendChild(styles);

  // Create bubble element
  function createBubble() {
    if (bubbleElement || currentMode === 'modal' || currentMode === 'mini') return;

    bubbleElement = document.createElement('div');
    bubbleElement.className = 'ls-bubble';
    bubbleElement.innerHTML = \`
      <div class="ls-bubble-inner">
        <div class="ls-live-dot"></div>
        <span class="ls-live-text">\${t.live}</span>
      </div>
    \`;
    bubbleElement.addEventListener('click', openModal);
    document.body.appendChild(bubbleElement);
    currentMode = 'bubble';
  }

  function removeBubble() {
    if (bubbleElement) {
      bubbleElement.remove();
      bubbleElement = null;
    }
  }

  // Open fullscreen modal
  function openModal() {
    removeBubble();
    removeMini();

    modalElement = document.createElement('div');
    modalElement.className = 'ls-modal-overlay';
    modalElement.innerHTML = \`
      <div class="ls-modal-container">
        <div class="ls-modal-controls">
          <button class="ls-modal-btn ls-minimize-btn" aria-label="\${t.minimize}">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </button>
          <button class="ls-modal-btn ls-close-btn" aria-label="\${t.close}">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <iframe
          class="ls-modal-iframe"
          src="\${BASE_URL}/embed/brand/\${BRAND_ID}?locale=en"
          allow="autoplay; fullscreen; web-share"
        ></iframe>
      </div>
    \`;

    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement) minimizeToMini();
    });

    modalElement.querySelector('.ls-close-btn').addEventListener('click', closeAll);
    modalElement.querySelector('.ls-minimize-btn').addEventListener('click', minimizeToMini);

    document.addEventListener('keydown', handleEscape);
    document.body.appendChild(modalElement);
    document.body.style.overflow = 'hidden';
    currentMode = 'modal';
  }

  function removeModal() {
    if (modalElement) {
      modalElement.remove();
      modalElement = null;
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    }
  }

  // Minimize to corner miniplayer
  function minimizeToMini() {
    removeModal();

    miniElement = document.createElement('div');
    miniElement.className = 'ls-mini';
    miniElement.innerHTML = \`
      <div class="ls-mini-controls">
        <button class="ls-mini-btn ls-maximize-btn" aria-label="\${t.maximize}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
          </svg>
        </button>
        <button class="ls-mini-btn ls-close-btn" aria-label="\${t.close}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <iframe
        class="ls-mini-iframe"
        src="\${BASE_URL}/embed/brand/\${BRAND_ID}?locale=en&mode=mini"
        allow="autoplay; fullscreen; web-share"
      ></iframe>
    \`;

    miniElement.querySelector('.ls-maximize-btn').addEventListener('click', openModal);
    miniElement.querySelector('.ls-close-btn').addEventListener('click', closeAll);

    document.body.appendChild(miniElement);
    currentMode = 'mini';
  }

  function removeMini() {
    if (miniElement) {
      miniElement.remove();
      miniElement = null;
    }
  }

  // Close everything and go back to bubble
  function closeAll() {
    removeModal();
    removeMini();
    currentMode = 'hidden';
    checkLiveStatus(); // This will recreate bubble if still live
  }

  function handleEscape(e) {
    if (e.key === 'Escape') {
      if (currentMode === 'modal') minimizeToMini();
    }
  }

  // Check live status
  async function checkLiveStatus() {
    try {
      const response = await fetch(\`\${BASE_URL}/api/brands/\${BRAND_ID}/live-status\`);
      const data = await response.json();

      if (data.isLive) {
        if (currentMode === 'hidden') {
          createBubble();
        }
      } else {
        if (currentMode === 'bubble') {
          removeBubble();
          currentMode = 'hidden';
        }
      }
    } catch (error) {
      console.error('[LiveShopping] Failed to check status:', error);
    }
  }

  // Initialize
  checkLiveStatus();
  setInterval(checkLiveStatus, CHECK_INTERVAL);

  // Expose API
  window.LiveShopping = {
    open: openModal,
    minimize: minimizeToMini,
    close: closeAll,
    check: checkLiveStatus
  };
})();
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
