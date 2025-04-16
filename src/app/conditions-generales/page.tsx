import React from 'react';

export const metadata = {
  title: 'Conditions Générales de Vente | Chanvre Vert',
  description: 'Conditions générales de vente et d\'utilisation du site Chanvre Vert, spécialiste des produits CBD de qualité.',
};

export default function ConditionsGeneralesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-emerald-800">Conditions Générales de Vente</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Article 1 - Objet et champ d'application</h2>
        <p className="mb-4">
          Les présentes conditions générales de vente (CGV) régissent les ventes de produits à base de CBD effectuées par la société Chanvre Vert SAS, 
          au capital de 10 000 €, dont le siège social est situé 123 Avenue du Chanvre, 75000 Paris, France,
          immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro 123 456 789.
        </p>
        <p className="mb-4">
          Ces CGV sont applicables à toute commande passée sur le site internet www.chanvre-vert.fr (ci-après "le Site") par toute personne 
          physique majeure agissant en tant que consommateur (ci-après "le Client").
        </p>
        <p className="mb-4">
          Toute commande implique l'acceptation sans réserve par le Client des présentes CGV. Ces conditions prévaudront sur toutes autres conditions 
          générales ou particulières non expressément agréées par Chanvre Vert.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Article 2 - Produits</h2>
        <p className="mb-4">
          Les produits proposés à la vente sont ceux qui figurent sur le Site, avec une description de leurs caractéristiques essentielles, 
          dans la limite des stocks disponibles.
        </p>
        <p className="mb-4">
          Les photographies illustrant les produits n'entrent pas dans le champ contractuel. Si ces photographies présentaient un quelconque 
          caractère inexact, la responsabilité de Chanvre Vert ne saurait être engagée.
        </p>
        <p className="mb-4">
          Conformément à la législation française, tous les produits commercialisés par Chanvre Vert sont issus de variétés de cannabis autorisées 
          et contiennent un taux de THC inférieur à 0,3% conformément à la réglementation européenne.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Article 3 - Prix</h2>
        <p className="mb-4">
          Les prix des produits sont indiqués en euros toutes taxes comprises (TTC), hors frais de livraison.
        </p>
        <p className="mb-4">
          Les frais de livraison sont indiqués avant la validation de la commande. Ils varient selon le mode de livraison choisi par le Client 
          et la destination de la commande.
        </p>
        <p className="mb-4">
          Chanvre Vert se réserve le droit de modifier ses prix à tout moment, étant toutefois entendu que le prix figurant au catalogue 
          le jour de la commande sera le seul applicable au Client.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Article 4 - Commandes</h2>
        <p className="mb-4">
          Le Client peut passer commande sur le Site. Pour ce faire, il doit :
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Sélectionner les produits et les ajouter au panier</li>
          <li>Valider le contenu du panier</li>
          <li>Créer un compte client ou se connecter à son compte</li>
          <li>Fournir les informations nécessaires à la livraison</li>
          <li>Choisir le mode de livraison</li>
          <li>Accepter les présentes CGV</li>
          <li>Procéder au paiement de la commande</li>
        </ul>
        <p className="mb-4">
          La confirmation définitive de la commande intervient après validation du paiement. Un email de confirmation 
          récapitulant le détail de la commande est envoyé au Client.
        </p>
        <p className="mb-4">
          Chanvre Vert se réserve le droit d'annuler ou de refuser toute commande d'un Client avec lequel existerait un litige relatif au paiement 
          d'une commande antérieure ou pour tout autre motif légitime.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Article 5 - Paiement</h2>
        <p className="mb-4">
          Le paiement s'effectue en ligne par carte bancaire (Visa, MasterCard) via une plateforme de paiement sécurisée.
        </p>
        <p className="mb-4">
          Le débit de la carte est effectué au moment de la validation de la commande.
        </p>
        <p className="mb-4">
          Chanvre Vert se réserve le droit de suspendre toute gestion de commande en cas de refus d'autorisation de paiement 
          par carte bancaire de la part des organismes officiellement accrédités.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Article 6 - Livraison</h2>
        <p className="mb-4">
          La livraison est effectuée à l'adresse indiquée par le Client lors de la commande.
        </p>
        <p className="mb-4">
          Les délais de livraison sont donnés à titre indicatif. Un retard de livraison ne peut en aucun cas donner lieu à 
          une annulation de la commande ou à des dommages et intérêts.
        </p>
        <p className="mb-4">
          En cas de colis endommagé ou de produits manquants, le Client doit émettre des réserves auprès du transporteur 
          au moment de la livraison et contacter le service client de Chanvre Vert dans les 48 heures.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Article 7 - Droit de rétractation</h2>
        <p className="mb-4">
          Conformément aux dispositions légales en vigueur, le Client dispose d'un délai de 14 jours à compter de la réception 
          des produits pour exercer son droit de rétractation sans avoir à justifier de motifs ni à payer de pénalités.
        </p>
        <p className="mb-4">
          Pour exercer ce droit, le Client doit notifier sa décision de rétractation au moyen d'une déclaration dénuée d'ambiguïté 
          par email à l'adresse retractation@chanvre-vert.fr ou par courrier à l'adresse du siège social.
        </p>
        <p className="mb-4">
          Les produits doivent être retournés dans leur état d'origine et complets (emballage, accessoires, notice...) dans un délai de 14 jours 
          suivant la notification de la décision de rétractation. Les frais de retour sont à la charge du Client.
        </p>
        <p className="mb-4">
          Chanvre Vert remboursera le Client de tous les paiements reçus, y compris les frais de livraison (à l'exception des frais supplémentaires 
          résultant du choix d'un mode de livraison autre que le mode standard proposé) dans les 14 jours à compter de la date à laquelle 
          elle est informée de la décision de rétractation.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Article 8 - Service client</h2>
        <p className="mb-4">
          Pour toute question ou réclamation, le Client peut contacter le service client :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Par email : contact@chanvre-vert.fr</li>
          <li>Par téléphone : +33 1 23 45 67 89 (du lundi au vendredi de 9h à 18h)</li>
          <li>Par courrier : Chanvre Vert SAS, Service Client, 123 Avenue du Chanvre, 75000 Paris, France</li>
        </ul>
      </div>
    </div>
  );
}
