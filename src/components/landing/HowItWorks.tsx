export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Connect Your Store',
      description: 'Link your online store in under 2 minutes. Products sync automatically and stay up to date.',
      icon: (
        <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Go Live or Upload',
      description: 'Stream from your browser, use your phone, or upload pre-recorded videos. Tag products at any moment.',
      icon: (
        <div className="flex items-center gap-1.5 bg-pink-500 text-white text-lg font-bold px-4 py-2 rounded-full shadow-lg shadow-pink-500/30">
          <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      ),
    },
    {
      number: '03',
      title: 'Viewers Buy Instantly',
      description: 'When you feature a product, viewers tap once to add to cart. Seamless checkout on your store.',
      icon: (
        <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
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
