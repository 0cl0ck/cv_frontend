'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';

const AgeVerificationModal: React.FC = () => {
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    const ageVerified = Cookies.get('age_verified');
    if (!ageVerified) {
      setIsVerified(false);
    }
  }, []);

  const handleVerification = () => {
    Cookies.set('age_verified', 'true', { expires: 365, path: '/' });
    setIsVerified(true);
  };

  if (isVerified) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Vérification de l&apos;âge</h2>
        <p className="mb-6">
          Vous devez avoir 18 ans ou plus pour accéder à ce site et acheter nos produits. Veuillez confirmer votre âge.
        </p>
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleVerification}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            J&apos;ai 18 ans ou plus
          </button>
          <a
            href="https://www.google.com"
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
          >
            Je n&apos;ai pas 18 ans
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          En cliquant sur &quot;J&apos;ai 18 ans ou plus&quot;, vous confirmez être majeur et acceptez notre <Link href="/terms" className="underline hover:text-white">politique</Link>.
        </p>
      </div>
    </div>
  );
};

export default AgeVerificationModal;
