import React from 'react';

export const metadata = {
  title: 'Politique de confidentialité | Chanvre Vert',
  description: 'Politique de confidentialité et de protection des données personnelles de Chanvre Vert.',
};

export default function ConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-emerald-800">Politique de Confidentialité</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Introduction</h2>
        <p className="mb-4">
          Chez Chanvre Vert, nous accordons une grande importance à la protection de vos données personnelles. 
          Cette politique de confidentialité vous informe de la manière dont nous collectons, utilisons et protégeons vos informations 
          lorsque vous utilisez notre site web et nos services.
        </p>
        <p className="mb-4">
          Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Responsable du traitement</h2>
        <p className="mb-4">
          Le responsable du traitement des données personnelles collectées sur le site www.chanvre-vert.fr est :
        </p>
        <ul className="list-none pl-5 space-y-2 mb-4">
          <li><strong>Société :</strong> Chanvre Vert SAS</li>
          <li><strong>Adresse :</strong> 123 Avenue du Chanvre, 75000 Paris, France</li>
          <li><strong>Email :</strong> privacy@chanvre-vert.fr</li>
          <li><strong>Téléphone :</strong> +33 1 23 45 67 89</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Données collectées</h2>
        <p className="mb-4">Nous collectons les types de données suivants :</p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li><strong>Données d'identification</strong> : nom, prénom, adresse email, adresse postale, numéro de téléphone</li>
          <li><strong>Données de commande</strong> : historique d'achats, produits consultés</li>
          <li><strong>Données de paiement</strong> : nous ne stockons pas vos informations de carte bancaire, qui sont traitées directement par nos prestataires de paiement sécurisés</li>
          <li><strong>Données de navigation</strong> : adresse IP, cookies, pages visitées, interactions avec le site</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Finalités du traitement</h2>
        <p className="mb-4">Nous utilisons vos données pour :</p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Gérer vos commandes et assurer le service après-vente</li>
          <li>Vous permettre de créer et gérer votre compte client</li>
          <li>Personnaliser votre expérience sur notre site</li>
          <li>Vous envoyer des communications marketing si vous y avez consenti</li>
          <li>Améliorer nos produits et services</li>
          <li>Se conformer à nos obligations légales</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Cookies et traceurs</h2>
        <p className="mb-4">
          Notre site utilise des cookies et autres traceurs pour améliorer votre expérience de navigation, 
          analyser notre trafic et personnaliser le contenu. Ces cookies peuvent être :
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li><strong>Cookies essentiels</strong> : nécessaires au fonctionnement du site</li>
          <li><strong>Cookies analytiques</strong> : pour mesurer l'audience et analyser la navigation</li>
          <li><strong>Cookies de personnalisation</strong> : pour vous proposer un contenu adapté à vos intérêts</li>
          <li><strong>Cookies publicitaires</strong> : pour vous proposer des publicités pertinentes</li>
        </ul>
        <p className="mb-4">
          Vous pouvez à tout moment désactiver les cookies en modifiant les paramètres de votre navigateur. 
          Cependant, certaines fonctionnalités du site pourraient ne plus être disponibles.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Base légale du traitement</h2>
        <p className="mb-4">Nos traitements de données sont fondés sur :</p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>L'exécution du contrat pour la gestion de vos commandes</li>
          <li>Votre consentement pour l'envoi de communications marketing</li>
          <li>Notre intérêt légitime pour l'amélioration de nos services</li>
          <li>Nos obligations légales (facturation, comptabilité, etc.)</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Sécurité des données</h2>
        <p className="mb-4">
          Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour garantir la sécurité de vos données, 
          notamment :
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>L'utilisation de protocoles de connexion sécurisés (HTTPS)</li>
          <li>Le chiffrement des données sensibles</li>
          <li>L'accès restreint aux données par le personnel autorisé</li>
          <li>Des audits de sécurité réguliers</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Vos droits</h2>
        <p className="mb-4">
          Conformément à la réglementation, vous disposez des droits suivants :
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification de vos données</li>
          <li>Droit à l'effacement de vos données</li>
          <li>Droit à la limitation du traitement</li>
          <li>Droit à la portabilité de vos données</li>
          <li>Droit d'opposition au traitement</li>
          <li>Droit de retirer votre consentement à tout moment</li>
          <li>Droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr)</li>
        </ul>
        <p className="mb-4">
          Pour exercer vos droits ou pour toute question concernant la protection de vos données personnelles, 
          vous pouvez nous contacter par email à privacy@chanvre-vert.fr ou par courrier à l'adresse de notre siège social.
        </p>
      </div>
    </div>
  );
}
