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
  let activeVideoElement = null;
  let globalMuted = true; // Shared mute state across all videos

  // Generate viewer ID for tracking
  const viewerId = 'carousel-' + Date.now() + '-' + Math.random().toString(36).slice(2);

  // Get Shopify store domain from the page or use default
  const shopifyDomain = window.Shopify?.shop || document.querySelector('meta[name="shopify-domain"]')?.content || '';

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
    .sv-thumbnail-video {
      pointer-events: none;
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
      opacity: 1;
      transition: opacity 0.2s;
    }
    .sv-controls .sv-pause-btn {
      opacity: 0;
    }
    .sv-video-container:hover .sv-controls .sv-pause-btn,
    .sv-video-container.sv-playing .sv-controls .sv-pause-btn {
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
    .sv-view-btn {
      width: 36px;
      height: 36px;
      background: #f3f4f6;
      border: none;
      border-radius: 50%;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.2s;
      flex-shrink: 0;
    }
    .sv-product-card:hover .sv-view-btn {
      background: #e5e7eb;
      transform: scale(1.1);
    }
    .sv-view-btn svg {
      width: 18px;
      height: 18px;
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

    const cfId = video.cloudflare_stream_id || video.cloudflare_playback_id;
    const videoSrc = cfId ? \`https://customer-\${cfAccountId}.cloudflarestream.com/\${cfId}/manifest/video.m3u8\` : '';

    item.innerHTML = \`
      <div class="sv-video-container" data-video-id="\${video.id}" data-cf-id="\${cfId || ''}">
        \${cfId ?
          \`<video class="sv-thumbnail-video" src="\${videoSrc}" preload="metadata" muted playsinline></video>\` :
          (thumbnail ?
            \`<img src="\${thumbnail}" alt="\${video.title}" class="sv-thumbnail" onerror="this.style.display='none'">\` :
            \`<div style="width:100%;height:100%;background:#e5e5e5;"></div>\`
          )
        }
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
        <div class="sv-product-card" data-product-id="\${product.id}" data-product-handle="\${product.handle || ''}" data-checkout-url="\${product.checkout_url || ''}" style="cursor: pointer;">
          <img src="\${product.image_url || ''}" alt="\${product.title}" class="sv-product-img">
          <div class="sv-product-info">
            <div class="sv-product-name">\${product.title}</div>
            <div class="sv-product-price">\${formatPrice(product.price, product.currency)}</div>
          </div>
          <span class="sv-view-btn" aria-label="View product">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      \` : ''}
    \`;

    const container = item.querySelector('.sv-video-container');
    const muteBtn = item.querySelector('.sv-mute-btn');
    const pauseBtn = item.querySelector('.sv-pause-btn');
    const thumbnailVideo = item.querySelector('.sv-thumbnail-video');

    function updateMuteIcon() {
      const mutedIcon = muteBtn.querySelector('.sv-icon-muted');
      const unmutedIcon = muteBtn.querySelector('.sv-icon-unmuted');
      mutedIcon.style.display = globalMuted ? '' : 'none';
      unmutedIcon.style.display = globalMuted ? 'none' : '';
    }

    function stopVideo() {
      if (thumbnailVideo) {
        thumbnailVideo.pause();
        thumbnailVideo.currentTime = 0;
        thumbnailVideo.muted = true;
      }
      container.classList.remove('sv-playing');
    }

    function startVideo() {
      // Stop and reset any other playing video
      if (activeVideoIndex !== null && activeVideoIndex !== index) {
        const activeItem = containerElement.querySelector(\`.sv-item[data-index="\${activeVideoIndex}"]\`);
        if (activeItem && activeItem.stopVideo) {
          activeItem.stopVideo();
        }
      }

      activeVideoIndex = index;

      if (thumbnailVideo) {
        thumbnailVideo.loop = true;
        thumbnailVideo.muted = globalMuted;
        container.classList.add('sv-playing');
        activeVideoElement = thumbnailVideo;

        thumbnailVideo.play().catch(console.error);
        updateMuteIcon();
      }
    }

    function pauseVideo() {
      if (thumbnailVideo) {
        thumbnailVideo.pause();
        container.classList.remove('sv-playing');
      }
    }

    function toggleMute() {
      globalMuted = !globalMuted;
      if (activeVideoElement) {
        activeVideoElement.muted = globalMuted;
      }
      // Update all mute icons
      containerElement.querySelectorAll('.sv-mute-btn').forEach(btn => {
        const mutedIcon = btn.querySelector('.sv-icon-muted');
        const unmutedIcon = btn.querySelector('.sv-icon-unmuted');
        mutedIcon.style.display = globalMuted ? '' : 'none';
        unmutedIcon.style.display = globalMuted ? 'none' : '';
      });
    }

    // Click on video container to play
    container.addEventListener('click', (e) => {
      if (e.target.closest('.sv-control-btn')) return; // Ignore control button clicks
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

    // Product card click handler with attribution tracking
    const productCard = item.querySelector('.sv-product-card');
    if (productCard) {
      productCard.addEventListener('click', (e) => {
        e.preventDefault();

        const productId = productCard.dataset.productId;
        const productHandle = productCard.dataset.productHandle;
        const checkoutUrl = productCard.dataset.checkoutUrl;
        const videoId = video.id;

        // Track product click event (fire and forget)
        fetch(\`\${BASE_URL}/api/videos/\${videoId}/events\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'product_click',
            viewerId: viewerId,
            productId: productId,
            metadata: {
              product_title: product.title,
              price: product.price,
              currency: product.currency,
              source: 'carousel_widget'
            }
          })
        }).catch(console.error);

        // Build product URL with attribution params
        let productUrl;
        if (checkoutUrl) {
          productUrl = checkoutUrl;
        } else if (productHandle && shopifyDomain) {
          productUrl = 'https://' + shopifyDomain + '/products/' + productHandle;
        } else if (productHandle) {
          productUrl = '/products/' + productHandle;
        }

        if (productUrl) {
          // Append attribution params
          const url = new URL(productUrl, window.location.origin);
          url.searchParams.set('utm_source', 'shoppable_video');
          url.searchParams.set('utm_medium', 'video');
          url.searchParams.set('utm_campaign', videoId);
          url.searchParams.set('utm_content', productId);
          url.searchParams.set('ssvid', videoId);
          url.searchParams.set('ssvwr', viewerId);

          window.open(url.toString(), '_blank');
        }
      });
    }

    // Expose functions for external control
    item.startVideo = startVideo;
    item.stopVideo = stopVideo;

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
