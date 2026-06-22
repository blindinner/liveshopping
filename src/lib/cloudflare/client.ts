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
