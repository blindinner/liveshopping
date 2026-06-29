export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Connect Your Store',
      description: 'Link your online store in under 2 minutes. Products sync automatically and stay up to date.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Go Live or Upload',
      description: 'Stream from your browser, use your phone, or upload pre-recorded videos. Tag products at any moment.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Viewers Buy Instantly',
      description: 'When you feature a product, viewers tap once to add to cart. Seamless checkout on your store.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">How It Works</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6">
            Start Selling in Minutes
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            No technical setup required. Get started in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-gray-200 to-transparent" />
              )}

              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center text-gray-300 shadow-sm">
                  {step.icon}
                </div>
                <span className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-pink-500/20">
                  {step.number.slice(-1)}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>

              <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
