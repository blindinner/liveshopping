export function Integrations() {
  const platforms = [
    { name: 'Shopify', color: '#96bf48' },
    { name: 'WooCommerce', color: '#7f54b3' },
    { name: 'BigCommerce', color: '#121118' },
    { name: 'Magento', color: '#ee672f' },
    { name: 'Custom', color: '#6b7280' },
  ];

  return (
    <section className="py-24 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">Integrations</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6">
            Works With Your Store
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Connect to your existing e-commerce platform. Products, inventory, and checkout—all synced automatically.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="bg-gray-50 rounded-xl px-8 py-4 flex items-center justify-center"
            >
              <span className="text-lg font-semibold text-gray-700">{platform.name}</span>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">2 min</div>
            <div className="text-gray-500 text-sm font-medium">Setup time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">Auto-sync</div>
            <div className="text-gray-500 text-sm font-medium">Products & inventory</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">Native</div>
            <div className="text-gray-500 text-sm font-medium">Checkout experience</div>
          </div>
        </div>
      </div>
    </section>
  );
}
