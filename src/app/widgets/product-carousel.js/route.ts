import { NextResponse } from 'next/server';

// GET /widgets/product-carousel.js - Video carousel for product pages (shows videos featuring a specific product)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const script = `
(function() {
  const scripts = document.querySelectorAll('script[data-shopify-product-id]');
  const currentScript = scripts[scripts.length - 1];
  const SHOPIFY_PRODUCT_ID = currentScript?.getAttribute('data-shopify-product-id');
  const TITLE = currentScript?.getAttribute('data-title') || 'Seen in Action';
  const BASE_URL = '${baseUrl}';

  if (!SHOPIFY_PRODUCT_ID) {
    console.error('[ShoppableVideos] Missing data-shopify-product-id attribute');
    return;
  }

  let containerElement = null;
  let videos = [];
  let activeVideoIndex = null;

  const styles = document.createElement('style');
  styles.textContent = \`
    .svp-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px 0;
    }
    .svp-title {
      font-size: 16px;
      font-weight: 700;
      color: #000;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .svp-carousel {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 4px 0;
    }
    .svp-carousel::-webkit-scrollbar {
      display: none;
    }

    .svp-item {
      flex-shrink: 0;
      width: 160px;
      scroll-snap-align: start;
    }

    .svp-video-container {
      position: relative;
      width: 100%;
      aspect-ratio: 9/16;
      border-radius: 12px;
      overflow: hidden;
      background: #000;
      cursor: pointer;
    }
    .svp-video-container video,
    .svp-video-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .svp-thumbnail-video {
      pointer-events: none;
    }


    .svp-video-title {
      font-size: 13px;
      font-weight: 500;
      color: #000;
      margin-top: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .svp-controls {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .svp-video-container:hover .svp-controls,
    .svp-video-container.svp-playing .svp-controls {
      opacity: 1;
    }
    .svp-control-btn {
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
    }
    .svp-control-btn:hover {
      background: rgba(0,0,0,0.8);
    }
    .svp-control-btn svg {
      width: 16px;
      height: 16px;
    }

    /* Modal for expanded view */
    .svp-modal {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: svp-fadeIn 0.2s ease;
    }
    @keyframes svp-fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .svp-modal-content {
      position: relative;
      width: 100%;
      max-width: 400px;
      height: 90vh;
      max-height: 712px;
    }
    .svp-modal-iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 16px;
    }
    .svp-modal-close {
      position: absolute;
      top: -40px;
      right: 0;
      width: 32px;
      height: 32px;
      background: rgba(255,255,255,0.2);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .svp-modal-close:hover {
      background: rgba(255,255,255,0.3);
    }
    .svp-modal-close svg {
      width: 20px;
      height: 20px;
    }
  \`;
  document.head.appendChild(styles);

  function createVideoItem(video, index) {
    const item = document.createElement('div');
    item.className = 'svp-item';
    item.dataset.index = index;

    const thumbnail = video.cover_image_url || video.thumbnail_url;
    const cfAccountId = '${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || 'f83anpt0jiknxr1e'}';

    const cfId = video.cloudflare_stream_id || video.cloudflare_playback_id;
    const videoSrc = cfId ? \`https://customer-\${cfAccountId}.cloudflarestream.com/\${cfId}/manifest/video.m3u8\` : '';

    item.innerHTML = \`
      <div class="svp-video-container" data-video-id="\${video.id}" data-cf-id="\${cfId || ''}">
        \${cfId ?
          \`<video class="svp-thumbnail-video" src="\${videoSrc}" preload="metadata" muted playsinline></video>\` :
          (thumbnail ?
            \`<img src="\${thumbnail}" alt="\${video.title}" class="svp-thumbnail">\` :
            \`<div style="width:100%;height:100%;background:#333;"></div>\`
          )
        }
        <div class="svp-controls">
          <button class="svp-control-btn svp-expand-btn" aria-label="Expand">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="svp-video-title">\${video.title}</div>
    \`;

    const container = item.querySelector('.svp-video-container');
    const expandBtn = item.querySelector('.svp-expand-btn');

    let videoElement = null;
    let isPlaying = false;

    const thumbnailVideo = item.querySelector('.svp-thumbnail-video');

    function startVideo() {
      if (isPlaying) return;

      // Pause any other playing video
      if (activeVideoIndex !== null && activeVideoIndex !== index) {
        const activeItem = containerElement.querySelector(\`.svp-item[data-index="\${activeVideoIndex}"]\`);
        if (activeItem) {
          const activeContainer = activeItem.querySelector('.svp-video-container');
          const activeThumbnailVideo = activeItem.querySelector('.svp-thumbnail-video');
          if (activeThumbnailVideo) {
            activeThumbnailVideo.pause();
            activeThumbnailVideo.currentTime = 0;
          }
          activeContainer.classList.remove('svp-playing');
          const thumb = activeItem.querySelector('.svp-thumbnail');
          if (thumb) thumb.style.display = '';
        }
      }

      activeVideoIndex = index;

      // Play the thumbnail video
      if (thumbnailVideo) {
        thumbnailVideo.loop = true;
        thumbnailVideo.muted = true;
        container.classList.add('svp-playing');
        isPlaying = true;
        thumbnailVideo.play().catch(console.error);
      }
    }

    function openModal() {
      const modal = document.createElement('div');
      modal.className = 'svp-modal';
      modal.innerHTML = \`
        <div class="svp-modal-content">
          <button class="svp-modal-close" aria-label="Close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <iframe class="svp-modal-iframe" src="\${BASE_URL}/embed/video/\${video.id}" allow="autoplay; fullscreen"></iframe>
        </div>
      \`;

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });

      modal.querySelector('.svp-modal-close').addEventListener('click', () => {
        modal.remove();
      });

      document.body.appendChild(modal);
    }

    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal();
    });

    container.addEventListener('click', () => {
      if (isPlaying) {
        openModal();
      } else {
        startVideo();
      }
    });

    // Expose startVideo for autoplay
    item.startVideo = startVideo;

    return item;
  }

  async function loadVideos() {
    try {
      const response = await fetch(\`\${BASE_URL}/api/products/\${SHOPIFY_PRODUCT_ID}/videos\`);
      const data = await response.json();
      videos = data.videos || [];

      if (videos.length === 0) {
        console.log('[ShoppableVideos] No videos found for this product');
        return;
      }

      render();
    } catch (error) {
      console.error('[ShoppableVideos] Failed to load videos:', error);
    }
  }

  function render() {
    containerElement = document.createElement('div');
    containerElement.className = 'svp-container';

    if (TITLE) {
      const titleEl = document.createElement('div');
      titleEl.className = 'svp-title';
      titleEl.textContent = TITLE;
      containerElement.appendChild(titleEl);
    }

    const carousel = document.createElement('div');
    carousel.className = 'svp-carousel';

    const items = [];
    videos.forEach((video, index) => {
      const item = createVideoItem(video, index);
      items.push(item);
      carousel.appendChild(item);
    });

    containerElement.appendChild(carousel);
    currentScript.parentNode.insertBefore(containerElement, currentScript.nextSibling);

    // Autoplay first video (muted)
    if (items.length > 0 && items[0].startVideo) {
      setTimeout(() => {
        items[0].startVideo();
      }, 100);
    }
  }

  loadVideos();

  window.ShoppableVideosProduct = window.ShoppableVideosProduct || {};
  window.ShoppableVideosProduct[SHOPIFY_PRODUCT_ID] = {
    refresh: loadVideos
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
