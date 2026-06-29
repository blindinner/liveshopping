import { NextResponse } from 'next/server';

// GET /widgets/carousel.js - Video carousel widget with inline playback
export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const script = `
(function() {
  const scripts = document.querySelectorAll('script[data-brand-id]');
  const currentScript = scripts[scripts.length - 1];
  const BRAND_ID = currentScript?.getAttribute('data-brand-id');
  const TITLE = currentScript?.getAttribute('data-title') || '';
  const BASE_URL = '${baseUrl}';

  if (!BRAND_ID) {
    console.error('[ShoppableVideos] Missing data-brand-id attribute');
    return;
  }

  let containerElement = null;
  let videos = [];
  let activeVideoIndex = null;

  const styles = document.createElement('style');
  styles.textContent = \`
    .sv-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px 0;
    }
    .sv-title {
      font-size: 24px;
      font-weight: 700;
      color: #000;
      text-align: center;
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .sv-carousel {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 4px 20px;
    }
    .sv-carousel::-webkit-scrollbar {
      display: none;
    }

    .sv-item {
      flex-shrink: 0;
      width: 280px;
      scroll-snap-align: start;
    }

    .sv-video-container {
      position: relative;
      width: 100%;
      aspect-ratio: 9/16;
      border-radius: 12px;
      overflow: hidden;
      background: #f0f0f0;
      cursor: pointer;
    }
    .sv-video-container video,
    .sv-video-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .sv-video-container iframe {
      width: 100%;
      height: 100%;
      border: none;
      pointer-events: none;
    }

    .sv-controls {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .sv-video-container:hover .sv-controls,
    .sv-video-container.sv-playing .sv-controls {
      opacity: 1;
    }
    .sv-control-btn {
      width: 36px;
      height: 36px;
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
    .sv-control-btn:hover {
      background: rgba(0,0,0,0.8);
    }
    .sv-control-btn svg {
      width: 18px;
      height: 18px;
    }

    .sv-play-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.1);
      transition: opacity 0.2s;
    }
    .sv-video-container.sv-playing .sv-play-overlay {
      opacity: 0;
      pointer-events: none;
    }
    .sv-play-btn {
      width: 60px;
      height: 60px;
      background: rgba(255,255,255,0.95);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s;
    }
    .sv-play-btn:hover {
      transform: scale(1.1);
    }
    .sv-play-btn svg {
      width: 24px;
      height: 24px;
      fill: #000;
      margin-left: 3px;
    }

    .sv-product-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
    }
    .sv-product-img {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      object-fit: cover;
      background: #f0f0f0;
    }
    .sv-product-info {
      flex: 1;
      min-width: 0;
    }
    .sv-product-name {
      font-size: 14px;
      font-weight: 600;
      color: #000;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sv-product-price {
      font-size: 14px;
      color: #666;
      margin-top: 2px;
    }
    .sv-add-btn {
      width: 36px;
      height: 36px;
      background: #2563eb;
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.2s;
      flex-shrink: 0;
    }
    .sv-add-btn:hover {
      background: #1d4ed8;
      transform: scale(1.1);
    }
    .sv-add-btn svg {
      width: 20px;
      height: 20px;
    }
    .sv-add-btn.sv-added {
      background: #16a34a;
    }
    .sv-add-btn.sv-added svg {
      width: 16px;
      height: 16px;
    }

    @media (max-width: 640px) {
      .sv-item {
        width: 200px;
      }
      .sv-carousel {
        padding: 4px 12px;
        gap: 12px;
      }
    }
  \`;
  document.head.appendChild(styles);

  function formatPrice(price, currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  }

  function createVideoItem(video, index) {
    const item = document.createElement('div');
    item.className = 'sv-item';
    item.dataset.index = index;

    const product = video.products?.[0]?.product || video.product;
    const thumbnail = video.cover_image_url || video.thumbnail_url;
    const cfAccountId = '${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || 'f83anpt0jiknxr1e'}';

    item.innerHTML = \`
      <div class="sv-video-container" data-video-id="\${video.id}" data-cf-id="\${video.cloudflare_stream_id || ''}">
        \${thumbnail ?
          \`<img src="\${thumbnail}" alt="\${video.title}" class="sv-thumbnail">\` :
          \`<div style="width:100%;height:100%;background:#e5e5e5;"></div>\`
        }
        <div class="sv-play-overlay">
          <button class="sv-play-btn" aria-label="Play">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <div class="sv-controls">
          <button class="sv-control-btn sv-mute-btn" aria-label="Mute">
            <svg class="sv-icon-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
            </svg>
            <svg class="sv-icon-unmuted" style="display:none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
            </svg>
          </button>
          <button class="sv-control-btn sv-pause-btn" aria-label="Pause">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"/>
            </svg>
          </button>
        </div>
      </div>
      \${product ? \`
        <div class="sv-product-card">
          <img src="\${product.image_url || ''}" alt="\${product.title}" class="sv-product-img">
          <div class="sv-product-info">
            <div class="sv-product-name">\${product.title}</div>
            <div class="sv-product-price">\${formatPrice(product.price, product.currency)}</div>
          </div>
          <button class="sv-add-btn" data-product-id="\${product.id}" data-variant-id="\${product.shopify_variant_id}" aria-label="Add to cart">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6"/>
            </svg>
          </button>
        </div>
      \` : ''}
    \`;

    const container = item.querySelector('.sv-video-container');
    const playBtn = item.querySelector('.sv-play-btn');
    const muteBtn = item.querySelector('.sv-mute-btn');
    const pauseBtn = item.querySelector('.sv-pause-btn');
    const addBtn = item.querySelector('.sv-add-btn');

    let videoElement = null;
    let isMuted = true;
    let isPlaying = false;

    function startVideo() {
      if (isPlaying) return;

      // Pause any other playing video
      if (activeVideoIndex !== null && activeVideoIndex !== index) {
        const activeItem = containerElement.querySelector(\`.sv-item[data-index="\${activeVideoIndex}"]\`);
        if (activeItem) {
          const activeContainer = activeItem.querySelector('.sv-video-container');
          const activeVideo = activeContainer.querySelector('video');
          if (activeVideo) {
            activeVideo.pause();
            activeVideo.remove();
          }
          activeContainer.classList.remove('sv-playing');
          const thumb = activeItem.querySelector('.sv-thumbnail');
          if (thumb) thumb.style.display = '';
        }
      }

      activeVideoIndex = index;
      const cfId = video.cloudflare_stream_id || video.cloudflare_playback_id;

      if (cfId) {
        videoElement = document.createElement('video');
        videoElement.src = \`https://customer-\${cfAccountId}.cloudflarestream.com/\${cfId}/manifest/video.m3u8\`;
        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.muted = isMuted;
        videoElement.playsInline = true;
        videoElement.style.cssText = 'width:100%;height:100%;object-fit:cover;';

        const thumb = container.querySelector('.sv-thumbnail');
        if (thumb) thumb.style.display = 'none';

        container.insertBefore(videoElement, container.firstChild);
        container.classList.add('sv-playing');
        isPlaying = true;

        videoElement.play().catch(console.error);
      }
    }

    function pauseVideo() {
      if (videoElement) {
        videoElement.pause();
        container.classList.remove('sv-playing');
        isPlaying = false;
      }
    }

    function toggleMute() {
      isMuted = !isMuted;
      if (videoElement) {
        videoElement.muted = isMuted;
      }
      const mutedIcon = muteBtn.querySelector('.sv-icon-muted');
      const unmutedIcon = muteBtn.querySelector('.sv-icon-unmuted');
      mutedIcon.style.display = isMuted ? '' : 'none';
      unmutedIcon.style.display = isMuted ? 'none' : '';
    }

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startVideo();
    });

    pauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isPlaying) {
        pauseVideo();
      } else {
        startVideo();
      }
    });

    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMute();
    });

    // Add to cart
    if (addBtn && product) {
      addBtn.addEventListener('click', async (e) => {
        e.stopPropagation();

        if (product.checkout_url) {
          window.open(product.checkout_url, '_blank');
          return;
        }

        try {
          addBtn.disabled = true;

          // Try Shopify AJAX API first
          if (window.Shopify?.shop || document.querySelector('[data-shopify-storefront]')) {
            const response = await fetch('/cart/add.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: product.shopify_variant_id,
                quantity: 1
              })
            });

            if (response.ok) {
              addBtn.classList.add('sv-added');
              addBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
              setTimeout(() => {
                addBtn.classList.remove('sv-added');
                addBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6"/></svg>';
              }, 2000);
              return;
            }
          }

          // Fallback: dispatch custom event
          window.dispatchEvent(new CustomEvent('shoppable-video-add-to-cart', {
            detail: { product, videoId: video.id }
          }));

          addBtn.classList.add('sv-added');
          addBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
          setTimeout(() => {
            addBtn.classList.remove('sv-added');
            addBtn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6"/></svg>';
          }, 2000);
        } catch (err) {
          console.error('Add to cart failed:', err);
        } finally {
          addBtn.disabled = false;
        }
      });
    }

    return item;
  }

  async function loadVideos() {
    try {
      const response = await fetch(\`\${BASE_URL}/api/brands/\${BRAND_ID}/videos\`);
      const data = await response.json();
      videos = data.videos || [];

      if (videos.length === 0) {
        console.log('[ShoppableVideos] No videos found');
        return;
      }

      render();
    } catch (error) {
      console.error('[ShoppableVideos] Failed to load videos:', error);
    }
  }

  function render() {
    containerElement = document.createElement('div');
    containerElement.className = 'sv-container';

    if (TITLE) {
      const titleEl = document.createElement('div');
      titleEl.className = 'sv-title';
      titleEl.textContent = TITLE;
      containerElement.appendChild(titleEl);
    }

    const carousel = document.createElement('div');
    carousel.className = 'sv-carousel';

    videos.forEach((video, index) => {
      carousel.appendChild(createVideoItem(video, index));
    });

    containerElement.appendChild(carousel);
    currentScript.parentNode.insertBefore(containerElement, currentScript.nextSibling);
  }

  loadVideos();

  window.ShoppableVideos = window.ShoppableVideos || {};
  window.ShoppableVideos[BRAND_ID] = {
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
