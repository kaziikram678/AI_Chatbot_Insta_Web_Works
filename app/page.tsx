import { ChatWidget } from '@/components/ChatWidget';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
          Insta Web Works
        </h1>
        <p className="text-lg text-gray-600">
          Zoho CRM Experts • Custom Portals • Web & Software Development
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <span className="px-4 py-2 bg-white rounded-lg shadow text-sm text-gray-700">Zoho CRM Customization</span>
          <span className="px-4 py-2 bg-white rounded-lg shadow text-sm text-gray-700">Workflow Automation</span>
          <span className="px-4 py-2 bg-white rounded-lg shadow text-sm text-gray-700">API Integrations</span>
        </div>
      </div>

      <ChatWidget />
    </main>
  );
}
