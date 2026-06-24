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
  const CHECK_INTERVAL = 30000; // Check every 30 seconds

  let isWidgetOpen = false;
  let bubbleElement = null;
  let modalElement = null;

  // Text labels
  const t = {
    live: 'LIVE',
    watchNow: 'Watch Now',
    close: 'Close'
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
    .ls-modal-close {
      position: absolute;
      top: 12px;
      right: 12px;
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
      z-index: 10;
      transition: background 0.2s;
    }
    .ls-modal-close:hover {
      background: rgba(0, 0, 0, 0.8);
    }
    .ls-modal-close svg {
      width: 20px;
      height: 20px;
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
    }
  \`;
  document.head.appendChild(styles);

  // Create bubble element
  function createBubble() {
    if (bubbleElement) return;

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
  }

  // Remove bubble
  function removeBubble() {
    if (bubbleElement) {
      bubbleElement.remove();
      bubbleElement = null;
    }
  }

  // Open modal with embed
  function openModal() {
    if (modalElement) return;
    isWidgetOpen = true;

    modalElement = document.createElement('div');
    modalElement.className = 'ls-modal-overlay';
    modalElement.innerHTML = \`
      <div class="ls-modal-container">
        <button class="ls-modal-close" aria-label="\${t.close}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <iframe
          class="ls-modal-iframe"
          src="\${BASE_URL}/embed/brand/\${BRAND_ID}?locale=en"
          allow="autoplay; fullscreen"
        ></iframe>
      </div>
    \`;

    // Close on overlay click
    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement) closeModal();
    });

    // Close button
    modalElement.querySelector('.ls-modal-close').addEventListener('click', closeModal);

    // Close on escape
    document.addEventListener('keydown', handleEscape);

    document.body.appendChild(modalElement);
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  function closeModal() {
    if (modalElement) {
      modalElement.remove();
      modalElement = null;
      isWidgetOpen = false;
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    }
  }

  function handleEscape(e) {
    if (e.key === 'Escape') closeModal();
  }

  // Check live status
  async function checkLiveStatus() {
    try {
      const response = await fetch(\`\${BASE_URL}/api/brands/\${BRAND_ID}/live-status\`);
      const data = await response.json();

      if (data.isLive) {
        createBubble();
      } else {
        removeBubble();
        if (isWidgetOpen) {
          // Optionally close modal when show ends
          // closeModal();
        }
      }
    } catch (error) {
      console.error('[LiveShopping] Failed to check status:', error);
    }
  }

  // Initialize
  checkLiveStatus();
  setInterval(checkLiveStatus, CHECK_INTERVAL);

  // Expose API for manual control
  window.LiveShopping = {
    open: openModal,
    close: closeModal,
    check: checkLiveStatus
  };
})();
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60', // Cache for 1 minute
    },
  });
}
