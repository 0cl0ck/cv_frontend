import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Conditions d\'utilisation | Chanvre Vert',
  description: 'Conditions d\'utilisation du site Chanvre Vert, spécialiste du CBD en France',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Conditions d&apos;Utilisation</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">
          Bienvenue sur le site www.chanvre-vert.fr, édité par Hugo Dewas EI.
        </p>
        <p className="mb-4">
          Les présentes conditions d&apos;utilisation régissent l&apos;utilisation de notre site web. 
          En accédant à ce site ou en l&apos;utilisant, vous acceptez d&apos;être lié par ces conditions.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Définitions et périmètre</h2>
        <p className="mb-4">
          Dans le cadre des présentes conditions d&apos;utilisation, les termes suivants ont la signification qui leur est donnée ci-après :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><span className="font-medium">Utilisateur :</span> toute personne accédant au site www.chanvre-vert.fr et naviguant sur ses pages</li>
          <li><span className="font-medium">Site :</span> ensemble des contenus et services accessibles à l&apos;adresse www.chanvre-vert.fr</li>
          <li><span className="font-medium">Services :</span> ensemble des fonctionnalités proposées par le site (consultation de produits, achat, formulaire de contact, etc.)</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Accès au site</h2>
        <p className="mb-4">
          Nous nous efforçons de maintenir le site accessible 24 heures sur 24 et 7 jours sur 7. 
          Il s&apos;agit toutefois d&apos;une obligation de moyens et non de résultat. 
          L&apos;accès au site peut être suspendu, limité ou interrompu à tout moment, 
          notamment pour des raisons de maintenance ou de force majeure.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Obligations de l&apos;utilisateur</h2>
        <p className="mb-4">
          En utilisant notre site, vous vous engagez à :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Ne pas utiliser le site de manière frauduleuse ou à des fins illicites</li>
          <li>Ne pas tenter d&apos;accéder aux parties sécurisées du site sans autorisation</li>
          <li>Ne pas publier de contenus diffamatoires, offensants ou contraires à la loi via nos formulaires de contact</li>
          <li>Ne pas entraver le bon fonctionnement du site par l&apos;introduction de logiciels malveillants</li>
          <li>Respecter les droits de propriété intellectuelle relatifs aux contenus du site</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Hyperliens externes</h2>
        <p className="mb-4">
          Le site peut contenir des liens hypertextes renvoyant vers des sites tiers. 
          Nous déclinons toute responsabilité quant au contenu de ces sites et aux éventuels dommages résultant de leur consultation. 
          La présence de ces liens n&apos;implique aucune approbation des contenus présentés sur ces sites externes.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Limitation de responsabilité</h2>
        <p className="mb-4">
          Nous nous efforçons d&apos;assurer l&apos;exactitude des informations diffusées sur le site, mais ne pouvons garantir leur exhaustivité ou leur parfaite exactitude. 
          Nous déclinons toute responsabilité :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>En cas d&apos;interruption ou de dysfonctionnement du site</li>
          <li>En cas d&apos;infection par un éventuel virus informatique</li>
          <li>Pour tout dommage résultant d&apos;une intrusion frauduleuse d&apos;un tiers sur le site</li>
          <li>Pour tout préjudice ou dommage indirect découlant de l&apos;utilisation de notre site</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Législation française sur le CBD</h2>
        <p className="mb-4">
          En France, la vente de produits contenant du CBD est légale à condition que :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Les produits contiennent du CBD extrait uniquement des fibres et des graines de chanvre</li>
          <li>La teneur en THC soit inférieure à 0,3% conformément à la réglementation européenne</li>
          <li>Les produits ne fassent pas l&apos;objet d&apos;allégations thérapeutiques non autorisées</li>
        </ul>
        <p className="mt-4">
          Tous les produits commercialisés par Chanvre Vert respectent strictement cette réglementation.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Politique de confidentialité et cookies</h2>
        <p className="mb-4">
          Votre utilisation du site est également soumise à notre {' '}
          <Link href="/privacy" className="text-green-600 hover:underline">Politique de confidentialité</Link>, 
          qui régit la collecte et le traitement de vos données personnelles.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Droit applicable et juridiction</h2>
        <p className="mb-4">
          Les présentes conditions d&apos;utilisation sont régies par le droit français. 
          En cas de litige, les tribunaux de Dunkerque seront seuls compétents.
        </p>
      </div>
    </div>
  );
}
