import React from 'react';

export const metadata = {
  title: 'Conditions Générales de Vente | Chanvre Vert',
  description: 'Conditions Générales de Vente de Chanvre Vert, spécialiste du CBD en France',
};

export default function CGVPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Conditions Générales de Vente</h1>
      
      {/* Section principale avec les CGV */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">1. Vendeur</h2>
          <p className="mb-4">
            Hugo Dewas EI – SIRET 978 589 893 00012 – 5 rue d&apos;Ypres, 59380 Bergues.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">2. Produits</h2>
          <p className="mb-4">
            Fleurs, huiles, résines, infusions CBD. THC ≤ 0,3 %.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">3. Prix</h2>
          <p className="mb-4">
            Affichés en euros TTC. Frais de livraison indiqués avant confirmation de commande.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">4. Commande</h2>
          <p className="mb-4">
            Étapes : panier {'>'} récapitulatif {'>'} paiement sécurisé Viva Wallet (3-DS) {'>'} e-mail de confirmation.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">5. Paiement</h2>
          <p className="mb-4">
            Cartes CB / Visa / MasterCard. Transaction sécurisée via Viva Wallet.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">6. Livraison</h2>
          <p className="mb-4">
            Colissimo 48 h. Frais : 4,90 € (offerts dès 60 €). Risques transférés à réception.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">7. Droit de rétractation</h2>
          <p className="mb-4">
            14 jours à compter de la réception (formulaire type en Annexe I). Produits scellés ouverts {"→"} exclusion.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">8. Garanties légales</h2>
          <p className="mb-4">
            Conformité (24 mois) et vices cachés (art. 1641 C. civ.).
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">9. Médiation</h2>
          <p className="mb-4">
            CNPM-Médiation Consommation (coordonnées ci-dessus). Plateforme ODR UE.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">10. Données personnelles</h2>
          <p className="mb-4">
            Voir Politique de confidentialité.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">11. Droit applicable</h2>
          <p className="mb-4">
            Droit français ; tribunal compétent : Dunkerque.
          </p>
        </section>
      </div>
    </div>
  );
}
