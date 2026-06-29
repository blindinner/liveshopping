export function Benefits() {
  const benefits = [
    {
      title: 'Higher Conversion Rates',
      stat: '10x',
      description: 'Live shopping converts at 10x the rate of traditional e-commerce because viewers are engaged and ready to buy.',
    },
    {
      title: 'Lower Return Rates',
      stat: '50%',
      description: 'Products sold via live video have 50% fewer returns because customers see exactly what they\'re getting.',
    },
    {
      title: 'Increased Average Order Value',
      stat: '30%',
      description: 'Impulse buying and bundle deals during live shows increase average order value by 30% or more.',
    },
    {
      title: 'Better Customer Relationships',
      stat: '∞',
      description: 'Live interaction builds trust and loyalty that keeps customers coming back show after show.',
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">Benefits</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6">
            Why Brands Choose Live Shopping
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Live shopping isn't just engaging—it drives real business results that traditional e-commerce can't match.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex gap-6 p-6 bg-gray-50 rounded-2xl"
            >
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-600 shrink-0">
                {benefit.stat}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-500 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
