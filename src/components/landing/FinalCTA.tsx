export function FinalCTA() {
  return (
    <section id="demo" className="py-24 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl p-12 sm:p-16 text-center overflow-hidden shadow-2xl shadow-pink-500/20">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0zNiAyMmgtMnYtNGgydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">
              Ready to Turn Viewers
              <br />
              Into Buyers?
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
              Book a demo and see how Live Shopping works with your products and audience.
            </p>

            <a
              href="#"
              className="inline-flex items-center gap-2 bg-white text-pink-600 px-8 py-4 rounded-full text-base font-semibold hover:bg-pink-50 transition-all hover:scale-[1.02] shadow-xl"
            >
              Book a Demo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>

            <p className="mt-8 text-sm text-white/60">
              Free pilot available. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
