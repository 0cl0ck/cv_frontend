import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Mentions légales | Chanvre Vert',
  description: 'Mentions légales de Chanvre Vert, spécialiste du CBD en France',
};

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">Mentions Légales</h1>
      
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Éditeur du site</h2>
        <p className="mb-2"><span className="font-medium">Nom commercial :</span> Chanvre Vert</p>
        <p className="mb-2"><span className="font-medium">Statut juridique :</span> Entreprise Individuelle</p>
        <p className="mb-2"><span className="font-medium">Société :</span> Hugo Dewas EI</p>
        <p className="mb-2"><span className="font-medium">Adresse :</span> 5 rue d&apos;Ypres, 59380 Bergues</p>
        <p className="mb-2"><span className="font-medium">RCS :</span> Dunkerque 978 589 893</p>
        <p className="mb-2"><span className="font-medium">N° TVA intracommunautaire :</span> Non-assujetti (art. 293 B CGI)</p>
        <p className="mb-2"><span className="font-medium">Adresse e-mail :</span> contact@chanvre-vert.fr</p>
        <p className="mb-2"><span className="font-medium">IDU REP Emballages :</span> [À COMPLÉTER AVEC VOTRE NUMÉRO IDU]</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Directeur de la publication</h2>
        <p className="mb-2">Hugo Dewas</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Hébergeur du site</h2>
        <p className="mb-2"><span className="font-medium">Raison sociale :</span> OVH SAS</p>
        <p className="mb-2"><span className="font-medium">Adresse :</span> 2 rue Kellermann, 59100 Roubaix, France</p>
        <p className="mb-2"><span className="font-medium">Téléphone :</span> 1007 (appel gratuit depuis un poste fixe en France)</p>
        <p className="mb-2"><span className="font-medium">Site web :</span> <a href="https://www.ovhcloud.com" className="text-green-600 hover:underline">www.ovhcloud.com</a></p>
        <p className="mb-2"><span className="font-medium">SIRET :</span> 424 761 419 00045</p>
        <p className="mb-2"><span className="font-medium">N° TVA intracommunautaire :</span> FR 22 424 761 419</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Documents contractuels</h2>
        <p className="mb-4">
          L'utilisation de notre site et les achats effectués sont régis par les documents suivants :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <Link href="/cgv" className="text-green-600 hover:underline">Conditions Générales de Vente (CGV)</Link>
          </li>
          <li>
            <Link href="/terms" className="text-green-600 hover:underline">Conditions Générales d&apos;Utilisation (CGU)</Link>
          </li>
        </ul>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Données personnelles</h2>
        <p className="mb-4">
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi &quot;Informatique et Libertés&quot;, les utilisateurs disposent d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition concernant leurs données personnelles. Pour plus d&apos;informations, veuillez consulter notre :
        </p>
        <p>
          <Link href="/confidentialite" className="text-green-600 hover:underline">Politique de Confidentialité</Link>
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Médiation de la consommation</h2>
        <p className="mb-4">
          Conformément aux dispositions du Code de la consommation concernant le règlement amiable des litiges, le Client peut en tout état de cause recourir à une médiation conventionnelle, notamment auprès de la Commission de la médiation de la consommation ou auprès des instances de médiation sectorielles existantes, ou à tout mode alternatif de règlement des différends (conciliation, par exemple) en cas de contestation.
        </p>
        <p className="mb-4">
          <span className="font-medium">CNPM - MÉDIATION - CONSOMMATION</span><br />
          27 avenue de la Libération, 42400 Saint-Chamond<br />
          <a href="https://cnpm-mediation-consommation.eu" className="text-green-600 hover:underline">https://cnpm-mediation-consommation.eu</a>
        </p>
        <p className="mb-4">
          <span className="font-medium">Plateforme européenne de résolution des litiges en ligne :</span><br />
          <a href="https://ec.europa.eu/consumers/odr" className="text-green-600 hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Cookies</h2>
        <p className="mb-4">
          Le site peut utiliser des cookies pour améliorer l&apos;expérience utilisateur. L&apos;utilisateur est informé que lors de ses visites sur le site, des cookies peuvent s&apos;installer automatiquement sur son logiciel de navigation. En naviguant sur le site, l&apos;utilisateur les accepte. Il peut désactiver ces cookies via les paramètres de son navigateur.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Produits à base de CBD</h2>
        <p className="mb-4">
          Les produits proposés sur ce site sont conformes à la législation française en vigueur. Ils contiennent un taux de THC inférieur ou égal à 0,3%. Ces produits ne sont pas des médicaments et ne doivent pas être utilisés comme tels. La vente est interdite aux mineurs. La consommation est déconseillée aux femmes enceintes ou allaitantes.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Propriété intellectuelle</h2>
        <p className="mb-4">
          Tous les contenus présents sur ce site, incluant, de façon non limitative, les graphismes, images, textes, vidéos, animations, sons, logos, gifs et icônes ainsi que leur mise en forme sont la propriété exclusive de l&apos;éditeur du site, à l&apos;exception des marques, logos ou contenus appartenant à d&apos;autres sociétés partenaires ou auteurs.
        </p>
      </div>
    </div>
  );
}
