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
  let activeVideoElement = null;
  let globalMuted = true;

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
      opacity: 1;
      transition: opacity 0.2s;
    }
    .svp-controls .svp-pause-btn {
      opacity: 0;
    }
    .svp-video-container:hover .svp-controls .svp-pause-btn,
    .svp-video-container.svp-playing .svp-controls .svp-pause-btn {
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
          <button class="svp-control-btn svp-mute-btn" aria-label="Mute">
            <svg class="svp-icon-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
            </svg>
            <svg class="svp-icon-unmuted" style="display:none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
            </svg>
          </button>
          <button class="svp-control-btn svp-pause-btn" aria-label="Pause">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="svp-video-title">\${video.title}</div>
    \`;

    const container = item.querySelector('.svp-video-container');
    const muteBtn = item.querySelector('.svp-mute-btn');
    const pauseBtn = item.querySelector('.svp-pause-btn');
    const thumbnailVideo = item.querySelector('.svp-thumbnail-video');

    function updateMuteIcon() {
      const mutedIcon = muteBtn.querySelector('.svp-icon-muted');
      const unmutedIcon = muteBtn.querySelector('.svp-icon-unmuted');
      mutedIcon.style.display = globalMuted ? '' : 'none';
      unmutedIcon.style.display = globalMuted ? 'none' : '';
    }

    function stopVideo() {
      if (thumbnailVideo) {
        thumbnailVideo.pause();
        thumbnailVideo.currentTime = 0;
        thumbnailVideo.muted = true;
      }
      container.classList.remove('svp-playing');
    }

    function startVideo() {
      // Stop and reset any other playing video
      if (activeVideoIndex !== null && activeVideoIndex !== index) {
        const activeItem = containerElement.querySelector(\`.svp-item[data-index="\${activeVideoIndex}"]\`);
        if (activeItem && activeItem.stopVideo) {
          activeItem.stopVideo();
        }
      }

      activeVideoIndex = index;

      if (thumbnailVideo) {
        thumbnailVideo.loop = true;
        thumbnailVideo.muted = globalMuted;
        container.classList.add('svp-playing');
        activeVideoElement = thumbnailVideo;

        thumbnailVideo.play().catch(console.error);
        updateMuteIcon();
      }
    }

    function pauseVideo() {
      if (thumbnailVideo) {
        thumbnailVideo.pause();
        container.classList.remove('svp-playing');
      }
    }

    function toggleMute() {
      globalMuted = !globalMuted;
      if (activeVideoElement) {
        activeVideoElement.muted = globalMuted;
      }
      // Update all mute icons
      containerElement.querySelectorAll('.svp-mute-btn').forEach(btn => {
        const mutedIcon = btn.querySelector('.svp-icon-muted');
        const unmutedIcon = btn.querySelector('.svp-icon-unmuted');
        mutedIcon.style.display = globalMuted ? '' : 'none';
        unmutedIcon.style.display = globalMuted ? 'none' : '';
      });
    }

    // Click on video container to play
    container.addEventListener('click', (e) => {
      if (e.target.closest('.svp-control-btn')) return;
      startVideo();
    });

    pauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isPaused = thumbnailVideo && thumbnailVideo.paused;
      if (isPaused) {
        startVideo();
      } else {
        pauseVideo();
      }
    });

    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMute();
    });

    // Expose functions for external control
    item.startVideo = startVideo;
    item.stopVideo = stopVideo;

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
