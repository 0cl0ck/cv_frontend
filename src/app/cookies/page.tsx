import React from 'react';
import Link from 'next/link';
import CookieButton from '@/components/CookieConsent/CookieButton';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: 'Politique de Cookies',
  description: 'Politique de gestion des cookies et traceurs de Chanvre Vert, conforme à la recommandation CNIL 2020-092',
  path: '/cookies',
});

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">Politique de Cookies</h1>
      <p className="text-center text-sm mb-6 text-gray-400">
        Version 1.0 - Dernière mise à jour le 09/05/2025
      </p>
      
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Qu&apos;est-ce qu&apos;un cookie ?</h2>
        <p className="mb-4">
          Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) 
          lors de votre visite sur notre site. Il nous permet de collecter des informations sur votre navigation 
          afin d&apos;améliorer votre expérience et nos services.
        </p>
        <p className="mb-4">
          Les cookies peuvent être déposés par nous (cookies propriétaires) ou par des tiers (cookies tiers).
        </p>
        <div className="mt-4 p-4 bg-gray-700 rounded">
          <p className="font-medium">Vous pouvez à tout moment gérer vos préférences en matière de cookies en cliquant sur le bouton ci-dessous :</p>
          <CookieButton />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Les cookies que nous utilisons</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">1. Cookies strictement nécessaires</h3>
          <div className="pl-4">
            <p className="mb-2"><span className="font-medium">Finalité :</span> Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés. Ils permettent l&apos;utilisation des principales fonctionnalités du site (accès à votre compte, panier d&apos;achat, etc.).</p>
            <p className="mb-2"><span className="font-medium">Base légale :</span> Intérêt légitime</p>
            <p className="mb-2"><span className="font-medium">Durée de conservation :</span> Session ou 13 mois maximum</p>
            <p><span className="font-medium">Émetteur(s) :</span> Chanvre Vert</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">2. Cookies de mesure d&apos;audience</h3>
          <div className="pl-4">
            <p className="mb-2"><span className="font-medium">Finalité :</span> Ces cookies nous permettent d&apos;analyser l&apos;utilisation de notre site afin d&apos;en mesurer et d&apos;en améliorer la performance. Ils nous aident à comprendre comment les visiteurs interagissent avec notre site en collectant et rapportant des informations de manière anonyme.</p>
            <p className="mb-2"><span className="font-medium">Base légale :</span> Consentement</p>
            <p className="mb-2"><span className="font-medium">Durée de conservation :</span> 13 mois maximum</p>
            <p><span className="font-medium">Émetteur(s) :</span> Google Analytics</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">3. Cookies de personnalisation</h3>
          <div className="pl-4">
            <p className="mb-2"><span className="font-medium">Finalité :</span> Ces cookies nous permettent de vous offrir une expérience personnalisée sur notre site en mémorisant vos préférences (langue, devise, mise en page, etc.).</p>
            <p className="mb-2"><span className="font-medium">Base légale :</span> Consentement</p>
            <p className="mb-2"><span className="font-medium">Durée de conservation :</span> 13 mois maximum</p>
            <p><span className="font-medium">Émetteur(s) :</span> Chanvre Vert</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">4. Cookies de réseaux sociaux et publicitaires</h3>
          <div className="pl-4">
            <p className="mb-2"><span className="font-medium">Finalité :</span> Ces cookies permettent d&apos;interagir avec les modules sociaux présents sur le site et peuvent être utilisés pour des fins publicitaires. Ils permettent également de vous proposer des publicités pertinentes en fonction de vos centres d&apos;intérêt.</p>
            <p className="mb-2"><span className="font-medium">Base légale :</span> Consentement</p>
            <p className="mb-2"><span className="font-medium">Durée de conservation :</span> 13 mois maximum</p>
            <p><span className="font-medium">Émetteur(s) :</span> Facebook, Instagram, Google</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Comment gérer vos cookies ?</h2>
        <p className="mb-4">
          Lors de votre première visite sur notre site, un bandeau vous informe de l&apos;utilisation des cookies et vous permet d&apos;exprimer vos choix :
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li><span className="font-medium">Tout accepter :</span> Vous consentez à l&apos;utilisation de tous les cookies mentionnés ci-dessus.</li>
          <li><span className="font-medium">Tout refuser :</span> Seuls les cookies strictement nécessaires au fonctionnement du site seront utilisés.</li>
          <li><span className="font-medium">Personnaliser :</span> Vous pouvez choisir précisément les catégories de cookies que vous souhaitez accepter ou refuser.</li>
        </ul>
        <p className="mb-4">
          Vous pouvez à tout moment modifier vos préférences en cliquant sur le bouton &quot;Gérer mes cookies&quot; présent en bas de chaque page du site.
        </p>
        <p className="mb-4">
          Vous pouvez également configurer votre navigateur pour qu&apos;il rejette automatiquement certains cookies. Cependant, le blocage de tous les cookies peut affecter le fonctionnement de notre site.
        </p>
        <p>
          Pour en savoir plus sur la façon de gérer les cookies dans votre navigateur, vous pouvez consulter les liens suivants :
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/fr/kb/protection-renforcee-contre-pistage-firefox" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Safari</a></li>
          <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Microsoft Edge</a></li>
        </ul>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">En savoir plus</h2>
        <p className="mb-4">
          Pour en savoir plus sur les cookies et la protection de vos données personnelles, vous pouvez consulter le site de la CNIL : {' '}
          <a href="https://www.cnil.fr/fr/cookies-et-autres-traceurs" className="text-green-600 hover:underline" target="_blank" rel="noopener noreferrer">
            https://www.cnil.fr/fr/cookies-et-autres-traceurs
          </a>
        </p>
        <p className="mb-4">
          Pour plus d&apos;informations sur la façon dont nous traitons vos données personnelles, veuillez consulter notre : {' '}
          <Link href="/confidentialite" className="text-green-600 hover:underline">
            Politique de confidentialité
          </Link>
        </p>
      </div>
    </div>
  );
}
