import React from 'react';
import Link from 'next/link';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: 'Conditions Générales de Vente',
  description: 'Conditions Générales de Vente de Chanvre Vert, spécialiste du CBD en France',
  path: '/cgv',
});

export default function CGVPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center">Conditions Générales de Vente</h1>
      <p className="text-sm text-gray-400 text-center mb-6">CGV mises à jour le 10/05/2025</p>
      
      {/* Section principale avec les CGV */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Vendeur</h2>
          <p className="mb-4">
            Hugo Dewas EI – SIRET 978 589 893 00012 – 5 rue d&apos;Ypres, 59380 Bergues.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Produits</h2>
          <p className="mb-4">
            Fleurs, huiles, résines, infusions CBD. Tous nos produits contiennent un taux de THC ≤ 0,3 % conformément à la législation en vigueur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Prix</h2>
          <p className="mb-4">
            Les prix sont affichés en euros TTC (toutes taxes comprises). Les frais de livraison sont indiqués avant la confirmation de la commande.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Commande</h2>
          <p className="mb-4">
            Étapes de passation de commande : ajout au panier {'>'} récapitulatif de commande {'>'} paiement sécurisé via Viva Wallet (authentification 3-DS) {'>'} e-mail de confirmation.
          </p>
          <p className="mb-4">
            La langue du contrat est le français. Le contrat de vente est conclu dès validation du paiement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Paiement</h2>
          <p className="mb-4">
            Les moyens de paiement acceptés sont les cartes bancaires (CB / Visa / MasterCard) ainsi que Google Pay. Les transactions sont sécurisées via notre prestataire Viva Wallet, qui assure la protection de vos données bancaires.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Livraison</h2>
          <p className="mb-4">
            Livraison via Colissimo en 48h ouvrées en France métropolitaine, Belgique, Suisse et Luxembourg. Frais de livraison : 4,90 € (offerts pour toute commande dès 60 €). Les risques sont transférés à l&apos;acheteur à la réception des produits.
          </p>
          <p className="mb-4">
            Conformément à la législation, le délai maximum de livraison est de 30 jours à compter de la confirmation de commande, sauf accord contraire spécifié lors de la commande.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Clause de réserve de propriété</h2>
          <p className="mb-4">
            Les marchandises demeurent la propriété de Hugo Dewas EI jusqu&apos;au paiement intégral du prix. Toutefois, les risques sont transférés à l&apos;acheteur dès la livraison des produits.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Droit de rétractation</h2>
          <p className="mb-4">
            Le client dispose d&apos;un délai de 14 jours à compter de la réception des produits pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités. Pour exercer ce droit, le client peut utiliser le formulaire de rétractation disponible sur notre site via le lien suivant : <Link href="/retractation" className="text-green-600 hover:underline">Formulaire de rétractation</Link>.
          </p>
          <p className="mb-4">
            Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les produits scellés qui ont été ouverts après la livraison et qui ne peuvent être renvoyés pour des raisons d&apos;hygiène ou de protection de la santé.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Garanties légales</h2>
          <p className="mb-4">
            Conformément aux articles L217-3 à L217-17 du Code de la consommation, le vendeur est tenu de livrer un bien conforme au contrat et répond des défauts de conformité existant lors de la délivrance. Le vendeur est également tenu de la garantie à raison des défauts cachés de la chose vendue qui la rendent impropre à l&apos;usage auquel on la destine, ou qui diminuent tellement cet usage que l&apos;acheteur ne l&apos;aurait pas acquise, ou n&apos;en aurait donné qu&apos;un moindre prix, s&apos;il les avait connus (article 1641 du Code civil).
          </p>
          <p className="mb-4">
            La garantie légale de conformité s&apos;applique indépendamment de la garantie commerciale éventuellement consentie. Le consommateur peut décider de mettre en œuvre la garantie contre les défauts cachés de la chose vendue au sens de l&apos;article 1641 du Code civil. Dans cette hypothèse, il peut choisir entre la résolution de la vente ou une réduction du prix de vente conformément à l&apos;article 1644 du Code civil.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Service client et réclamations</h2>
          <p className="mb-4">
            Pour toute question ou réclamation, notre service client est disponible à l&apos;adresse e-mail suivante : contact@chanvre-vert.fr. Nous nous engageons à traiter votre demande dans un délai maximum de 15 jours ouvrés.
          </p>
          <p className="mb-4">
            Conformément aux dispositions du Code de la consommation concernant le règlement amiable des litiges, le client doit adresser une réclamation écrite à notre service client. Si le client n&apos;a pas obtenu de réponse satisfaisante dans un délai de 2 mois, il peut recourir à une procédure de médiation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Médiation</h2>
          <p className="mb-4">
            En cas de litige non résolu avec notre service client, le consommateur peut recourir gratuitement au service de médiation CNPM-Médiation Consommation, dont les coordonnées complètes sont disponibles sur simple demande. Le client peut également utiliser la plateforme européenne de règlement en ligne des litiges (ODR) accessible à l&apos;adresse : https://ec.europa.eu/consumers/odr/.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Archivage et preuve électronique</h2>
          <p className="mb-4">
            Les registres informatisés conservés dans les systèmes informatiques de Chanvre Vert seront conservés dans des conditions raisonnables de sécurité et considérés comme les preuves des communications, des commandes et des paiements intervenus entre les parties.
          </p>
          <p className="mb-4">
            Conformément à l&apos;article L213-1 du Code de la consommation, pour toute commande d&apos;un montant égal ou supérieur à 120 euros, Hugo Dewas EI conserve l&apos;écrit constatant le contrat pendant une durée de 10 ans à compter de la livraison. Le client peut y accéder à tout moment en adressant une demande par email à contact@chanvre-vert.fr ou par courrier à l&apos;adresse du siège social.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Données personnelles</h2>
          <p className="mb-4">
            Les informations concernant la collecte et le traitement des données personnelles sont détaillées dans notre Politique de confidentialité, accessible depuis notre site internet.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Droit applicable</h2>
          <p className="mb-4">
            Les présentes Conditions Générales de Vente sont régies par le droit français. En cas de litige, les tribunaux français seront compétents, le tribunal compétent étant celui de Dunkerque.
          </p>
        </section>
      </div>
    </div>
  );
}
