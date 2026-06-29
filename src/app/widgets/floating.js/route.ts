import { NextResponse } from 'next/server';

// GET /widgets/floating.js - Floating video bubble widget
export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const script = `
(function() {
  const scripts = document.querySelectorAll('script[data-brand-id]');
  const currentScript = scripts[scripts.length - 1];
  const BRAND_ID = currentScript?.getAttribute('data-brand-id');
  const POSITION = currentScript?.getAttribute('data-position') || 'bottom-right';
  const BASE_URL = '${baseUrl}';

  if (!BRAND_ID) {
    console.error('[ShoppableVideos] Missing data-brand-id attribute');
    return;
  }

  let currentMode = 'bubble'; // 'bubble' | 'expanded' | 'hidden'
  let bubbleElement = null;
  let expandedElement = null;
  let videos = [];
  let currentVideoIndex = 0;

  const positions = {
    'bottom-right': { bottom: '24px', right: '24px' },
    'bottom-left': { bottom: '24px', left: '24px' },
    'top-right': { top: '24px', right: '24px' },
    'top-left': { top: '24px', left: '24px' }
  };

  const pos = positions[POSITION] || positions['bottom-right'];

  const styles = document.createElement('style');
  styles.textContent = \`
    @keyframes svf-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes svf-slideIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .svf-bubble {
      position: fixed;
      \${Object.entries(pos).map(([k, v]) => k + ':' + v).join(';')};
      z-index: 999999;
      cursor: pointer;
      animation: svf-slideIn 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .svf-bubble-inner {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    }
    .svf-bubble:hover .svf-bubble-inner {
      transform: scale(1.1);
    }
    .svf-bubble img, .svf-bubble video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .svf-bubble-play {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.3);
    }
    .svf-bubble-play svg {
      width: 28px;
      height: 28px;
      fill: white;
      margin-left: 3px;
    }
    .svf-bubble-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ec4899;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .svf-bubble-close {
      position: absolute;
      top: -8px;
      left: -8px;
      width: 24px;
      height: 24px;
      background: #374151;
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .svf-bubble:hover .svf-bubble-close {
      opacity: 1;
    }
    .svf-bubble-close svg {
      width: 12px;
      height: 12px;
    }

    .svf-expanded {
      position: fixed;
      \${Object.entries(pos).map(([k, v]) => k + ':' + v).join(';')};
      z-index: 999999;
      width: 320px;
      height: 568px;
      background: black;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      animation: svf-slideIn 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .svf-expanded-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .svf-expanded-controls {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      gap: 8px;
      z-index: 10;
    }
    .svf-expanded-btn {
      width: 32px;
      height: 32px;
      background: rgba(0,0,0,0.6);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .svf-expanded-btn:hover {
      background: rgba(0,0,0,0.8);
    }
    .svf-expanded-btn svg {
      width: 16px;
      height: 16px;
    }
    .svf-expanded-nav {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 6px;
      z-index: 10;
    }
    .svf-expanded-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255,255,255,0.4);
      cursor: pointer;
      transition: background 0.2s;
    }
    .svf-expanded-dot.active {
      background: white;
    }

    @media (max-width: 480px) {
      .svf-bubble {
        \${POSITION.includes('right') ? 'right: 16px' : 'left: 16px'};
        \${POSITION.includes('bottom') ? 'bottom: 16px' : 'top: 16px'};
      }
      .svf-bubble-inner {
        width: 64px;
        height: 64px;
      }
      .svf-expanded {
        width: calc(100vw - 32px);
        height: calc(100vh - 120px);
        max-height: 600px;
        \${POSITION.includes('right') ? 'right: 16px' : 'left: 16px'};
        \${POSITION.includes('bottom') ? 'bottom: 16px' : 'top: 16px'};
      }
    }
  \`;
  document.head.appendChild(styles);

  function createBubble() {
    if (bubbleElement || videos.length === 0) return;

    const video = videos[0];
    bubbleElement = document.createElement('div');
    bubbleElement.className = 'svf-bubble';
    bubbleElement.innerHTML = \`
      <button class="svf-bubble-close" aria-label="Close">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <div class="svf-bubble-inner">
        \${video.thumbnail_url || video.cover_image_url ?
          '<img src="' + (video.cover_image_url || video.thumbnail_url) + '" alt="">' :
          '<div style="width:100%;height:100%;background:#374151;"></div>'
        }
        <div class="svf-bubble-play">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      \${videos.length > 1 ? '<div class="svf-bubble-badge">' + videos.length + '</div>' : ''}
    \`;

    bubbleElement.querySelector('.svf-bubble-inner').addEventListener('click', expand);
    bubbleElement.querySelector('.svf-bubble-close').addEventListener('click', (e) => {
      e.stopPropagation();
      hide();
    });

    document.body.appendChild(bubbleElement);
    currentMode = 'bubble';
  }

  function removeBubble() {
    if (bubbleElement) {
      bubbleElement.remove();
      bubbleElement = null;
    }
  }

  function expand() {
    removeBubble();
    if (expandedElement) return;

    const video = videos[currentVideoIndex];
    expandedElement = document.createElement('div');
    expandedElement.className = 'svf-expanded';
    expandedElement.innerHTML = \`
      <div class="svf-expanded-controls">
        <button class="svf-expanded-btn minimize" aria-label="Minimize">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
        </button>
        <button class="svf-expanded-btn close" aria-label="Close">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <iframe class="svf-expanded-iframe" src="\${BASE_URL}/embed/video/\${video.id}" allow="autoplay; fullscreen"></iframe>
      \${videos.length > 1 ? \`
        <div class="svf-expanded-nav">
          \${videos.map((_, i) => '<div class="svf-expanded-dot' + (i === currentVideoIndex ? ' active' : '') + '" data-index="' + i + '"></div>').join('')}
        </div>
      \` : ''}
    \`;

    expandedElement.querySelector('.minimize').addEventListener('click', minimize);
    expandedElement.querySelector('.close').addEventListener('click', hide);

    expandedElement.querySelectorAll('.svf-expanded-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'), 10);
        goToVideo(index);
      });
    });

    document.body.appendChild(expandedElement);
    currentMode = 'expanded';
  }

  function goToVideo(index) {
    if (index < 0 || index >= videos.length) return;
    currentVideoIndex = index;
    if (expandedElement) {
      const iframe = expandedElement.querySelector('.svf-expanded-iframe');
      iframe.src = \`\${BASE_URL}/embed/video/\${videos[index].id}\`;

      expandedElement.querySelectorAll('.svf-expanded-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
  }

  function minimize() {
    if (expandedElement) {
      expandedElement.remove();
      expandedElement = null;
    }
    createBubble();
  }

  function hide() {
    removeBubble();
    if (expandedElement) {
      expandedElement.remove();
      expandedElement = null;
    }
    currentMode = 'hidden';
  }

  async function loadVideos() {
    try {
      const response = await fetch(\`\${BASE_URL}/api/brands/\${BRAND_ID}/videos\`);
      const data = await response.json();
      videos = data.videos || [];

      if (videos.length > 0) {
        createBubble();
      }
    } catch (error) {
      console.error('[ShoppableVideos] Failed to load videos:', error);
    }
  }

  loadVideos();

  window.ShoppableVideosFloating = window.ShoppableVideosFloating || {};
  window.ShoppableVideosFloating[BRAND_ID] = {
    expand,
    minimize,
    hide,
    show: createBubble,
    goToVideo
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
