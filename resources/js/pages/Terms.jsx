import React from 'react';

const TermsAndConditions = () => {
  const lastUpdated = "January 28, 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans text-gray-800">
      <h1 className="text-4xl font-bold mb-4 text-indigo-700">Terms and Conditions</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: {lastUpdated}</p>

      <section className="mb-8">
        <p className="leading-relaxed">
          Welcome to <strong>Kudo Class</strong>. By accessing our website and using our services, 
          you agree to be bound by the following terms and conditions. Please read them carefully.
        </p>
      </section>

      <hr className="my-8 border-gray-200" />

      <div className="space-y-8">
        {/* 1. Use of Service */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Use of Service</h2>
          <p>
            Kudo Class provides educational content and live sessions. You agree to use the 
            platform only for lawful purposes and in a way that does not infringe the rights 
            of others or restrict their use of the platform.
          </p>
        </section>

        {/* 2. User Accounts */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">2. User Accounts</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>Users under 18 must have parental or guardian consent to use our services.</li>
          </ul>
        </section>

        {/* 3. Payments and Refunds */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Payments and Refunds</h2>
          <p>
            Fees for classes are billed in advance. We reserve the right to change our pricing 
            at any time. Refund requests are subject to our <strong>Refund Policy</strong>, 
            which typically allows for cancellations within 48 hours of purchase.
          </p>
        </section>

        {/* 4. Intellectual Property */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Intellectual Property</h2>
          <p>
            All content, including videos, worksheets, and logos, are the property of Kudo Class. 
            You may not record, redistribute, or sell our content without express written permission.
          </p>
        </section>

        {/* 5. Limitation of Liability */}
        <section className="bg-gray-50 p-6 rounded-lg border-l-4 border-indigo-500">
          <h2 className="text-2xl font-semibold mb-3">5. Limitation of Liability</h2>
          <p className="italic">
            Kudo Class is provided "as is." We are not liable for any indirect, incidental, 
            or consequential damages arising from your use of the platform.
          </p>
        </section>

        {/* 6. Contact Us */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at: 
            <span className="text-indigo-600 font-medium ml-1 cursor-pointer hover:underline">
              support@kudoclass.com
            </span>
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <button 
          onClick={() => window.print()} 
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Print a Copy
        </button>
      </div>
    </div>
  );
};

export default TermsAndConditions;