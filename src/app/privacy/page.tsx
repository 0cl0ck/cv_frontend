import React from 'react';

export const metadata = {
  title: 'Politique de confidentialité | Chanvre Vert',
  description: 'Politique de confidentialité et de protection des données personnelles de Chanvre Vert.',
};

export default function PrivacyPage() {
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
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Durée de conservation</h2>
        <p className="mb-4">
          Nous conservons vos données pendant la durée strictement nécessaire aux finalités pour lesquelles elles ont été collectées, 
          conformément à la réglementation en vigueur :
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Données de compte client : jusqu'à la suppression de votre compte ou après 3 ans d'inactivité</li>
          <li>Données de commande : 10 ans pour des raisons comptables et fiscales</li>
          <li>Données de navigation : 13 mois maximum</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Destinataires des données</h2>
        <p className="mb-4">
          Vos données peuvent être transmises aux catégories de destinataires suivantes :
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Notre personnel habilité</li>
          <li>Nos sous-traitants (hébergement, logistique, paiement, emailing)</li>
          <li>Les autorités administratives ou judiciaires lorsque la loi l'exige</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
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
          <li>Droit d'introduire une réclamation auprès de la CNIL</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Contact</h2>
        <p className="mb-4">
          Pour exercer vos droits ou pour toute question concernant la protection de vos données personnelles, vous pouvez nous contacter :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Par email : privacy@chanvre-vert.fr</li>
          <li>Par courrier : Chanvre Vert SAS, Délégué à la Protection des Données, 123 Avenue du Chanvre, 75000 Paris, France</li>
        </ul>
      </div>
    </div>
  );
}
