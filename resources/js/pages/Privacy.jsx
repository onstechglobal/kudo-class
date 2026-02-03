import React from 'react';

const PrivacyPolicy = () => {
  const lastUpdated = "January 28, 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-gray-800">
      <h1 className="text-4xl font-bold mb-4 text-emerald-700">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: {lastUpdated}</p>

      <section className="mb-8">
        <p className="leading-relaxed text-lg">
          At <strong>Kudo Class</strong>, we take your privacy seriously. This policy explains 
          what information we collect, how we use it, and how we keep it safe.
        </p>
      </section>

      <hr className="my-8 border-gray-200" />

      <div className="space-y-10">
        {/* 1. Information We Collect */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
            Information We Collect
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border p-4 rounded-lg bg-gray-50">
              <h3 className="font-bold mb-2">Personal Data</h3>
              <p className="text-sm text-gray-600">Name, email address, and billing information provided during registration.</p>
            </div>
            <div className="border p-4 rounded-lg bg-gray-50">
              <h3 className="font-bold mb-2">Usage Data</h3>
              <p className="text-sm text-gray-600">IP addresses, browser types, and your interactions with our learning modules.</p>
            </div>
          </div>
        </section>

        {/* 2. How We Use Your Data */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
            How We Use Your Data
          </h2>
          <p className="mb-4">We use your information to provide a personalized learning experience, including:</p>
          <ul className="list-disc pl-8 space-y-2">
            <li>Managing your account and providing customer support.</li>
            <li>Processing payments through secure third-party gateways.</li>
            <li>Sending course updates, newsletters, and promotional offers (you can opt-out anytime).</li>
            <li>Improving our website functionality and course content.</li>
          </ul>
        </section>

        {/* 3. Data Protection */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
            Data Protection & Security
          </h2>
          <p>
            We implement industry-standard encryption to protect your data. While no method 
            of transmission over the internet is 100% secure, we strive to use 
            commercially acceptable means to protect your personal information.
          </p>
        </section>

        {/* 4. Third-Party Sharing */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
            Third-Party Services
          </h2>
          <p>
            We do not sell your data. We only share information with trusted partners like 
            <strong> Stripe</strong> (for payments) or <strong>AWS</strong> (for hosting), 
            who are also committed to protecting your privacy.
          </p>
        </section>

        {/* 5. Your Rights */}
        <section className="bg-emerald-50 p-6 rounded-xl">
          <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-medium">
            <li className="flex items-center">✅ Request a copy of your data</li>
            <li className="flex items-center">✅ Request data deletion</li>
            <li className="flex items-center">✅ Correct inaccurate info</li>
            <li className="flex items-center">✅ Withdraw marketing consent</li>
          </ul>
        </section>
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Questions about our privacy practices? Reach out to <a href="mailto:privacy@kudoclass.com" className="text-emerald-600 underline"> support@kudoclass.com </a></p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;