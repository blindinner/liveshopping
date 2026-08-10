export function Features() {
  const features = [
    {
      title: 'Live Shopping',
      subtitle: 'Sell while you stream.',
      description: 'Go live from your browser or phone. Feature products in real-time and let viewers checkout with one tap—without leaving the stream.',
      highlights: ['Browser & mobile streaming', 'Real-time product featuring', 'Live chat & reactions', 'Instant checkout'],
      visual: (
        <div className="relative h-64 rounded-xl overflow-hidden">
          <img
            src="/features-live-shopping.png"
            alt="Live Shopping demo showing a host presenting a product with real-time checkout"
            className="w-full h-full object-cover object-top rounded-xl"
          />
        </div>
      ),
    },
    {
      title: 'Shoppable Videos',
      subtitle: 'Turn every video into infinite growth assets.',
      description: 'Tag products at specific moments in your videos. Viewers click to buy exactly when they see something they want.',
      highlights: ['Timestamp product tagging', 'Automatic VOD processing', 'Embed anywhere', 'Analytics per video'],
      visual: (
        <div className="relative h-64 rounded-xl overflow-hidden">
          <img
            src="/features-shoppable-videos.png"
            alt="Shoppable video demo showing product tagging at specific timestamps"
            className="w-full h-full object-cover object-center rounded-xl"
          />
        </div>
      ),
    },
    {
      title: 'Performance Analytics',
      subtitle: 'Know exactly what video drives revenue.',
      description: 'See which videos convert, influence revenue, and accelerate growth—with clear, actionable insights.',
      highlights: ['Real-time metrics', 'Revenue attribution', 'Conversion tracking', 'Viewer behavior data'],
      visual: (
        <div className="relative h-64 bg-gradient-to-br from-pink-50 to-white rounded-xl overflow-hidden p-4">
          {/* Mock analytics chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full">
            <div className="text-xs text-gray-400 mb-1">Apr 25, 2026</div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-sm text-gray-600">Conversion</span>
              <span className="text-2xl font-bold text-gray-900">8.7%</span>
            </div>
            <svg className="w-full h-24" viewBox="0 0 200 60">
              <polyline
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                points="0,50 30,45 60,48 90,35 120,40 150,25 180,20 200,15"
              />
              <circle cx="200" cy="15" r="4" fill="#22c55e" />
            </svg>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Apr 1</span>
              <span>Apr 15</span>
              <span>Apr 20</span>
              <span>Apr 30</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-24 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">Features</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6">
            Everything You Need to Sell With Video
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Three powerful tools that work together to turn your content into a sales channel.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-gray-50 rounded-2xl hover:bg-gray-100/80 transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-900 font-medium mb-3">
                {feature.subtitle}
              </p>

              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {feature.description}
              </p>

              <a
                href="#demo"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 border border-gray-300 px-4 py-2 rounded-full hover:bg-white transition-colors mb-6"
              >
                LEARN MORE
              </a>

              {feature.visual}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
