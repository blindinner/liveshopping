'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface BroadcastPanelProps {
  webRtcUrl: string;
  isShowLive: boolean;
  onStartShow: () => void;
  onEndShow: () => void;
  compact?: boolean; // When true, renders just the video (for MobilePreview)
}

export function BroadcastPanel({
  webRtcUrl,
  isShowLive,
  onStartShow,
  onEndShow,
  compact = false,
}: BroadcastPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Request camera permission and start preview
  const startPreview = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Could not access camera. Please allow camera permission.');
    }
  }, [facingMode]);

  // Start streaming to Cloudflare via WebRTC
  const startStreaming = useCallback(async () => {
    if (!streamRef.current || !webRtcUrl) {
      setError('No camera stream or WebRTC URL available');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
        bundlePolicy: 'max-bundle',
      });

      peerConnectionRef.current = pc;

      // Add tracks from camera stream
      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current!);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE gathering to complete
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          pc.addEventListener('icegatheringstatechange', () => {
            if (pc.iceGatheringState === 'complete') {
              resolve();
            }
          });
        }
      });

      // Send offer to Cloudflare WHIP endpoint
      const response = await fetch(webRtcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
        },
        body: pc.localDescription?.sdp,
      });

      if (!response.ok) {
        throw new Error(`WHIP request failed: ${response.status}`);
      }

      // Get answer from Cloudflare
      const answerSdp = await response.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      setIsStreaming(true);
      onStartShow();
    } catch (err) {
      console.error('Streaming error:', err);
      setError('Failed to start streaming. Please try again.');
      stopStreaming();
    } finally {
      setIsConnecting(false);
    }
  }, [webRtcUrl, onStartShow]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Flip camera
  const flipCamera = useCallback(async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    // Restart stream with new camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // If currently streaming, update the tracks
      if (peerConnectionRef.current && isStreaming) {
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === 'video');
        const audioSender = senders.find((s) => s.track?.kind === 'audio');

        if (videoSender && stream.getVideoTracks()[0]) {
          await videoSender.replaceTrack(stream.getVideoTracks()[0]);
        }
        if (audioSender && stream.getAudioTracks()[0]) {
          await audioSender.replaceTrack(stream.getAudioTracks()[0]);
        }
      }
    } catch (err) {
      console.error('Failed to flip camera:', err);
    }
  }, [facingMode, isStreaming]);

  // Handle end show
  const handleEndShow = useCallback(() => {
    stopStreaming();
    onEndShow();
  }, [stopStreaming, onEndShow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  // Auto-start preview when component mounts
  useEffect(() => {
    if (!hasPermission) {
      startPreview();
    }
  }, [hasPermission, startPreview]);

  // Video preview content (shared between compact and full mode)
  const videoContent = (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
      />

      {!hasPermission && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/60">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm">Requesting camera...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <Button size="sm" onClick={startPreview}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Live indicator */}
      {isStreaming && (
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500 px-2 py-1 rounded-full">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-bold">LIVE</span>
        </div>
      )}

      {/* Camera controls (inside video for compact mode) */}
      {hasPermission && compact && (
        <div className="absolute bottom-16 inset-x-3 flex justify-center gap-3">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full ${
              isMuted ? 'bg-red-500' : 'bg-white/20'
            } backdrop-blur-sm`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          <button
            onClick={flipCamera}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
            title="Flip Camera"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}

      {/* Go Live / End Show button in compact mode */}
      {compact && hasPermission && (
        <div className="absolute bottom-4 inset-x-3">
          {!isStreaming && !isShowLive ? (
            <Button
              onClick={startStreaming}
              disabled={isConnecting}
              isLoading={isConnecting}
              size="sm"
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Go Live'}
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={handleEndShow}
              size="sm"
              className="w-full"
            >
              End Show
            </Button>
          )}
        </div>
      )}
    </>
  );

  // Compact mode - just video fills the container
  if (compact) {
    return (
      <div className="absolute inset-0 bg-black">
        {videoContent}
      </div>
    );
  }

  // Full mode - with section wrapper and external controls
  return (
    <section className="bg-white/5 rounded-2xl p-4">
      <h2 className="text-base font-semibold text-white mb-4">
        Go Live
      </h2>

      {/* Camera Preview */}
      <div className="relative aspect-[9/16] max-w-xs mx-auto bg-black rounded-xl overflow-hidden mb-4">
        {videoContent}

        {/* Camera controls (outside video for full mode) */}
        {hasPermission && !compact && (
          <div className="absolute bottom-3 inset-x-3 flex justify-center gap-3">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full ${
                isMuted ? 'bg-red-500' : 'bg-white/20'
              } backdrop-blur-sm`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            <button
              onClick={flipCamera}
              className="p-3 rounded-full bg-white/20 backdrop-blur-sm"
              title="Flip Camera"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        {!isStreaming && !isShowLive ? (
          <Button
            onClick={startStreaming}
            disabled={!hasPermission || isConnecting}
            isLoading={isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Connecting...' : 'Go Live'}
          </Button>
        ) : (
          <Button
            variant="danger"
            onClick={handleEndShow}
            className="w-full"
          >
            End Show
          </Button>
        )}
      </div>

      {/* Status text */}
      <p className="text-white/50 text-xs text-center mt-3">
        {isStreaming
          ? 'You are live! Viewers can see your stream.'
          : hasPermission
          ? 'Preview your camera. Click "Go Live" when ready.'
          : 'Allow camera access to start streaming.'}
      </p>
    </section>
  );
}
