// Cloudflare Stream API client for live streaming

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;

interface CloudflareLiveInput {
  uid: string;
  rtmps: {
    url: string;
    streamKey: string;
  };
  webRTC: {
    url: string;
  };
  webRTCPlayback: {
    url: string;
  };
  srt: {
    url: string;
    streamId: string;
    passphrase: string;
  };
  status: {
    current: {
      state: string;
    };
  } | null;
  meta?: {
    name?: string;
  };
  created: string;
  modified: string;
}

interface CreateLiveInputResponse {
  result: CloudflareLiveInput;
  success: boolean;
  errors: Array<{ message: string }>;
}

interface GetLiveInputResponse {
  result: CloudflareLiveInput;
  success: boolean;
  errors: Array<{ message: string }>;
}

// Create a new live input for streaming
export async function createLiveInput(name?: string): Promise<{
  uid: string;
  webRtcUrl: string;
  webRtcPlaybackUrl: string;
  rtmpUrl: string;
  streamKey: string;
}> {
  const response = await fetch(`${API_BASE}/live_inputs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      meta: { name: name || 'Live Shopping Stream' },
      recording: {
        mode: 'automatic',
      },
    }),
  });

  const data: CreateLiveInputResponse = await response.json();

  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || 'Failed to create live input');
  }

  return {
    uid: data.result.uid,
    webRtcUrl: data.result.webRTC.url,
    webRtcPlaybackUrl: data.result.webRTCPlayback.url,
    rtmpUrl: data.result.rtmps.url,
    streamKey: data.result.rtmps.streamKey,
  };
}

// Get live input status
export async function getLiveInputStatus(uid: string): Promise<{
  isLive: boolean;
  state: string;
}> {
  const response = await fetch(`${API_BASE}/live_inputs/${uid}`, {
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
  });

  const data: GetLiveInputResponse = await response.json();

  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || 'Failed to get live input status');
  }

  const state = data.result.status?.current?.state || 'disconnected';

  return {
    isLive: state === 'connected',
    state,
  };
}

// Delete a live input
export async function deleteLiveInput(uid: string): Promise<void> {
  const response = await fetch(`${API_BASE}/live_inputs/${uid}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    console.error('Failed to delete live input:', uid);
  }
}

// Get the playback URL for a live input
export function getPlaybackUrl(uid: string): string {
  return `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${uid}/iframe`;
}

// Get HLS playback URL
export function getHlsPlaybackUrl(uid: string): string {
  return `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${uid}/manifest/video.m3u8`;
}

// ============================================
// VOD (Video on Demand) Upload Functions
// ============================================

interface DirectUploadResponse {
  result: {
    uid: string;
    uploadURL: string;
  };
  success: boolean;
  errors: Array<{ message: string }>;
}

interface VideoDetailsResponse {
  result: {
    uid: string;
    status: {
      state: 'pendingupload' | 'downloading' | 'queued' | 'inprogress' | 'ready' | 'error';
      errorReasonCode?: string;
      errorReasonText?: string;
    };
    meta?: {
      name?: string;
    };
    playback?: {
      hls: string;
      dash: string;
    };
    thumbnail?: string;
    duration?: number;
    created: string;
    modified: string;
  };
  success: boolean;
  errors: Array<{ message: string }>;
}

// Create a direct upload URL for client-side video upload (TUS protocol)
export async function createDirectUploadUrl(options: {
  maxDurationSeconds?: number;
  name?: string;
}): Promise<{
  uid: string;
  uploadUrl: string;
}> {
  const { maxDurationSeconds = 3600, name } = options;

  const response = await fetch(`${API_BASE}/direct_upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      maxDurationSeconds,
      meta: name ? { name } : undefined,
    }),
  });

  const data: DirectUploadResponse = await response.json();

  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || 'Failed to create upload URL');
  }

  return {
    uid: data.result.uid,
    uploadUrl: data.result.uploadURL,
  };
}

// Get video details and processing status
export async function getVideoDetails(uid: string): Promise<{
  uid: string;
  status: 'pendingupload' | 'downloading' | 'queued' | 'inprogress' | 'ready' | 'error';
  errorMessage?: string;
  playbackId: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
}> {
  const response = await fetch(`${API_BASE}/${uid}`, {
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
  });

  const data: VideoDetailsResponse = await response.json();

  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || 'Failed to get video details');
  }

  return {
    uid: data.result.uid,
    status: data.result.status.state,
    errorMessage: data.result.status.errorReasonText,
    playbackId: data.result.uid, // In Cloudflare, the uid is also the playback ID
    thumbnailUrl: data.result.thumbnail || null,
    durationSeconds: data.result.duration ? Math.round(data.result.duration) : null,
  };
}

// Delete a video
export async function deleteVideo(uid: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${uid}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    console.error('Failed to delete video:', uid);
  }
}

// Get thumbnail URL for a video
export function getThumbnailUrl(uid: string, options?: {
  time?: string; // e.g., "1s", "5s"
  width?: number;
  height?: number;
}): string {
  const { time = '1s', width, height } = options || {};
  let url = `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg?time=${time}`;
  if (width) url += `&width=${width}`;
  if (height) url += `&height=${height}`;
  return url;
}
