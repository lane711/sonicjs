export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            SonicJS AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern, TypeScript-first headless CMS built specifically for Cloudflare&apos;s edge platform
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">⚡ Edge-First</h3>
              <p className="text-gray-600">
                Built for Cloudflare&apos;s global edge network with D1, R2, and Workers
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">🔧 Developer-Centric</h3>
              <p className="text-gray-600">
                TypeScript-first approach with configuration over UI
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">🤖 AI-Friendly</h3>
              <p className="text-gray-600">
                Structured codebase designed for AI-assisted development
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✅ <strong>Stage 1 Complete:</strong> Foundation & Core Infrastructure
            </div>
            <div className="mt-4 text-gray-600">
              <p>Next up: Stage 2 - Core API & Authentication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}