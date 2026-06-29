export function Problem() {
  const stats = [
    {
      stat: '73%',
      label: 'Want to Buy',
      description: 'of live stream viewers want to purchase but face checkout friction',
    },
    {
      stat: '68%',
      label: 'Drop Off',
      description: 'of impulse buyers abandon multi-step checkout processes',
    },
    {
      stat: '0%',
      label: 'Data Ownership',
      description: 'of customer data you own when selling on social platforms',
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">The Problem</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6">
            Video Content Deserves Better Conversion
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            You create engaging content, but turning viewers into buyers is harder than it should be.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((item, index) => (
            <div
              key={index}
              className="relative group p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-600 mb-2">
                {item.stat}
              </div>
              <div className="text-gray-900 font-semibold text-lg mb-3">
                {item.label}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
