import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Confidentialité | Chanvre Vert',
  description: 'Politique de confidentialité de Chanvre Vert, spécialiste du CBD en France',
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">Politique de Confidentialité</h1>
      <p className="text-center text-sm mb-6 text-gray-400">
        Version 1.0 - Dernière mise à jour le 09/05/2025
      </p>
      
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">
          Chez Chanvre Vert, nous accordons une grande importance à la protection de vos données personnelles. 
          Cette politique de confidentialité vous informe de la manière dont nous collectons, utilisons et protégeons vos informations 
          lorsque vous utilisez notre site web et nos services.
        </p>
        <p className="mb-4">
          Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Responsable du traitement</h2>
        <p className="mb-4">
          Le responsable du traitement des données personnelles collectées sur le site www.chanvre-vert.fr est :
        </p>
        <ul className="list-none pl-5 space-y-2">
          <li><span className="font-medium">Identité :</span> Hugo Dewas EI</li>
          <li><span className="font-medium">Adresse :</span> 5 rue d&apos;Ypres, 59380 Bergues, France</li>
          <li><span className="font-medium">Email :</span> contact@chanvre-vert.fr</li>
          <li><span className="font-medium">SIRET :</span> 978 589 893 00012</li>
        </ul>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Données collectées et finalités</h2>
        <p className="mb-4">Le tableau ci-dessous précise les données que nous collectons, les finalités de leur traitement, la base légale et leur durée de conservation :</p>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="border border-gray-700 p-2 text-left">Finalité</th>
                <th className="border border-gray-700 p-2 text-left">Données collectées</th>
                <th className="border border-gray-700 p-2 text-left">Base légale</th>
                <th className="border border-gray-700 p-2 text-left">Durée de conservation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-700 p-2">Gestion des commandes</td>
                <td className="border border-gray-700 p-2">Nom, prénom, adresse, email, téléphone, historique d&apos;achats</td>
                <td className="border border-gray-700 p-2">Exécution contractuelle</td>
                <td className="border border-gray-700 p-2">5 ans après la dernière commande</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-2">Compte client</td>
                <td className="border border-gray-700 p-2">Nom, prénom, email, mot de passe</td>
                <td className="border border-gray-700 p-2">Consentement</td>
                <td className="border border-gray-700 p-2">Jusqu&apos;à suppression du compte</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-2">Mesures d&apos;audience</td>
                <td className="border border-gray-700 p-2">Cookies, adresse IP, pages visitées</td>
                <td className="border border-gray-700 p-2">Consentement</td>
                <td className="border border-gray-700 p-2">13 mois</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-2">Communication marketing</td>
                <td className="border border-gray-700 p-2">Email</td>
                <td className="border border-gray-700 p-2">Consentement</td>
                <td className="border border-gray-700 p-2">3 ans après le dernier contact</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Destinataires des données</h2>
        <p className="mb-4">Vos données personnelles peuvent être transmises aux destinataires suivants :</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><span className="font-medium">OVH :</span> hébergement du site</li>
          <li><span className="font-medium">Viva Wallet :</span> traitement des paiements</li>
          <li><span className="font-medium">Transporteurs :</span> livraison des commandes</li>
          <li><span className="font-medium">Prestataire d&apos;emailing :</span> envoi des newsletters et communications</li>
          <li><span className="font-medium">CNPM-Médiation Consommation :</span> en cas de médiation</li>
        </ul>
        <p className="mt-4">
          Ces prestataires n&apos;ont accès qu&apos;aux données strictement nécessaires à l&apos;exécution de leurs missions et s&apos;engagent contractuellement à assurer un niveau de protection adéquat.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Transferts hors Union Européenne</h2>
        <p className="mb-4">
          Vos données sont principalement traitées au sein de l&apos;Union Européenne. Notre activité étant limitée à la France et à la Belgique, nous ne transférons pas vos données en dehors de l&apos;Union Européenne, sauf si un sous-traitant utilise des serveurs situés en dehors de l&apos;UE.
        </p>
        <p className="mb-4">
          Dans ce cas, nous nous assurons que ce transfert est encadré par des garanties appropriées conformément au RGPD (décision d&apos;adéquation, clauses contractuelles types, etc.).
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Mesures de sécurité</h2>
        <p className="mb-4">
          Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles, notamment :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Connexion HTTPS sécurisée sur l&apos;ensemble du site</li>
          <li>Chiffrement des données sensibles dans notre base de données</li>
          <li>Accès restreint aux données personnelles (uniquement personnel autorisé)</li>
          <li>Mises à jour régulières de nos systèmes et formation de notre personnel</li>
        </ul>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Gestion des cookies</h2>
        <p className="mb-4">
          Notre site utilise des cookies et autres traceurs pour améliorer votre expérience et mesurer l'audience. Lors de votre première visite, un bandeau vous permet d'accepter, de refuser ou de personnaliser vos choix.
        </p>
        <p className="mb-4">
          Pour obtenir une information détaillée sur les cookies que nous utilisons et pour modifier vos préférences à tout moment, veuillez consulter notre page dédiée :
        </p>
        <p>
          <Link href="/cookies" className="text-green-600 hover:underline">Politique de gestion des Cookies</Link>
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Vos droits</h2>
        <p className="mb-4">
          Conformément à la réglementation, vous disposez des droits suivants :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Droit d&apos;accès à vos données</li>
          <li>Droit de rectification de vos données</li>
          <li>Droit à l&apos;effacement de vos données</li>
          <li>Droit à la limitation du traitement</li>
          <li>Droit à la portabilité de vos données</li>
          <li>Droit d&apos;opposition au traitement</li>
          <li>Droit de définir des directives relatives au sort de vos données après votre décès</li>
        </ul>
        <p className="mt-4">
          Pour exercer ces droits ou pour toute question concernant vos données personnelles, contactez-nous à contact@chanvre-vert.fr ou par courrier à l&apos;adresse mentionnée ci-dessus.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Réclamation auprès de la CNIL</h2>
        <p className="mb-4">
          Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez adresser une réclamation (plainte) à la CNIL via leur site internet : {' '}
          <Link href="https://www.cnil.fr" className="text-green-600 hover:underline" target="_blank" rel="noopener noreferrer">
            www.cnil.fr
          </Link>
        </p>
      </div>
    </div>
  );
}
