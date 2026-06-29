export function Results() {
  const metrics = [
    {
      value: '10x',
      label: 'Higher Conversion',
      description: 'vs traditional e-commerce',
    },
    {
      value: '30%',
      label: 'Increase in AOV',
      description: 'average order value',
    },
    {
      value: '50%',
      label: 'Fewer Returns',
      description: 'customers see before they buy',
    },
    {
      value: '3x',
      label: 'More Time on Site',
      description: 'engaged viewers stay longer',
    },
  ];

  const caseStudies = [
    {
      metric: '225%',
      description: 'higher add-to-cart rate',
      industry: 'Fashion',
    },
    {
      metric: '17%',
      description: 'conversion rate achieved',
      industry: 'Beauty',
    },
    {
      metric: '45%',
      description: 'live show conversion',
      industry: 'Sports',
    },
    {
      metric: '1,500%',
      description: 'sales growth',
      industry: 'Home',
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-8 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-pink-400 text-sm font-semibold tracking-wide uppercase mb-4">Results</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            The Numbers Speak for Themselves
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Brands using live shopping and shoppable video consistently outperform traditional e-commerce.
          </p>
        </div>

        {/* Main metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-500 mb-2">
                {metric.value}
              </div>
              <div className="text-xl font-semibold text-white mb-1">
                {metric.label}
              </div>
              <div className="text-sm text-gray-500">
                {metric.description}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-16" />

        {/* Case study metrics */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-2">Real Brand Results</h3>
          <p className="text-gray-400">What brands across industries are achieving</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {caseStudies.map((study, index) => (
            <div
              key={index}
              className="bg-gray-800/50 rounded-2xl p-6 text-center border border-gray-700/50"
            >
              <div className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-3">
                {study.industry}
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                {study.metric}
              </div>
              <div className="text-sm text-gray-400">
                {study.description}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">
            Ready to see what live shopping can do for your brand?
          </p>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-pink-600 transition-all hover:scale-[1.02]"
          >
            Book a Demo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
