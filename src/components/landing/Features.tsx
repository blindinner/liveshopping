export function Features() {
  const features = [
    {
      title: 'Live Shopping',
      subtitle: 'Sell while you stream.',
      description: 'Go live from your browser or phone. Feature products in real-time and let viewers checkout with one tap—without leaving the stream.',
      highlights: ['Browser & mobile streaming', 'Real-time product featuring', 'Live chat & reactions', 'Instant checkout'],
      visual: (
        <div className="relative h-64 bg-gradient-to-br from-pink-50 to-white rounded-xl overflow-hidden">
          {/* Mock live stream UI */}
          <div className="absolute inset-4 bg-gray-200 rounded-lg overflow-hidden">
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              1.2k
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-3 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Summer Dress</div>
                <div className="text-sm text-pink-500 font-semibold">$49.00</div>
              </div>
              <button className="bg-pink-500 text-white text-xs font-semibold px-4 py-2 rounded-full">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Shoppable Videos',
      subtitle: 'Turn every video into infinite growth assets.',
      description: 'Tag products at specific moments in your videos. Viewers click to buy exactly when they see something they want.',
      highlights: ['Timestamp product tagging', 'Automatic VOD processing', 'Embed anywhere', 'Analytics per video'],
      visual: (
        <div className="relative h-64 bg-gradient-to-br from-pink-50 to-white rounded-xl overflow-hidden p-4">
          {/* Mock video with product tags */}
          <div className="flex gap-3 h-full">
            <div className="w-1/2 bg-gray-200 rounded-lg relative">
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">04:37</div>
              <div className="absolute bottom-12 right-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                AI
              </div>
            </div>
            <div className="w-1/2 flex flex-col gap-2">
              <div className="flex-1 bg-gray-100 rounded-lg relative border-2 border-pink-300 p-2">
                <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded">16s</div>
                <div className="w-full h-full bg-gray-200 rounded" />
              </div>
              <div className="flex-1 bg-gray-100 rounded-lg relative border-2 border-pink-300 p-2">
                <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded">23s</div>
                <div className="w-full h-full bg-gray-200 rounded" />
              </div>
            </div>
          </div>
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
