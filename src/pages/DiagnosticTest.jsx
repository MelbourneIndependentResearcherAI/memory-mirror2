import React from 'react';

export default function DiagnosticTest() {
  return (
    <div className="min-h-screen bg-green-500 p-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-12 shadow-2xl max-w-2xl">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ✅ App is Working!
        </h1>
        <p className="text-xl text-slate-700 mb-4">
          If you can see this page, the React app is rendering correctly.
        </p>
        <div className="space-y-2 text-sm text-slate-600">
          <p>✅ React is working</p>
          <p>✅ Router is working</p>
          <p>✅ Tailwind CSS is working</p>
          <p>✅ Components can render</p>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-slate-700">
            <strong>Next step:</strong> Try navigating to the Landing page. If it's blank, the issue is specific to that page or its dependencies.
          </p>
        </div>
      </div>
    </div>
  );
}