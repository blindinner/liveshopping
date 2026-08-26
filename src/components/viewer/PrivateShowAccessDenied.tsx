'use client';

interface PrivateShowAccessDeniedProps {
  showTitle?: string;
}

export function PrivateShowAccessDenied({ showTitle }: PrivateShowAccessDeniedProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Lock icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-3">Private Event</h1>

        {showTitle && (
          <p className="text-lg text-white/80 mb-4">{showTitle}</p>
        )}

        {/* Message */}
        <p className="text-white/60 mb-8">
          This is a private event. You need an invitation to participate.
        </p>

        {/* Contact info */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <p className="text-white/60 text-sm mb-3">
            Want to join? Contact us at:
          </p>
          <a
            href="mailto:benji@shopablevids.com"
            className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            benji@shopablevids.com
          </a>
        </div>
      </div>
    </div>
  );
}
