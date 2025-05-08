import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import StarRating from './StarRating';

export type ReviewType = {
  id: string;
  rating: number;
  reviewTitle: string;
  reviewContent: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  user: string | {
    id: string;
    // Structure PayloadCMS en anglais
    firstName?: string;
    lastName?: string;
    // Structure PayloadCMS en français
    prenom?: string;
    nom?: string;
    // Information supplémentaire qui peut être utile
    email?: string;
    [key: string]: any; // Pour gérer d'autres propriétés possibles
  };
  createdAt: string;
  // Champs spécifiques pour transmettre les informations utilisateur 
  // quand user est juste un ID
  userDisplayName?: string;
};

type ReviewItemProps = {
  review: ReviewType;
};

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  // Formatage de la date (en format français)
  const formattedDate = format(new Date(review.createdAt), 'dd MMMM yyyy', { 
    locale: fr 
  });
  
  // Déboguer les données de l'utilisateur de manière détaillée
  console.log('=============================');
  console.log(`\u{1F464} DONNÉES AVIS ${review.id}:`);
  console.log(`Date: ${review.createdAt}`);
  console.log(`User: ${typeof review.user === 'string' ? review.user : JSON.stringify(review.user, null, 2)}`);
  console.log(`UserDisplayName: "${review.userDisplayName || 'NON DÉFINI'}"`);
  console.log(`Content: ${review.reviewContent?.substring(0, 30)}...`);
  console.log('=============================');
  
  // Identifier si l'avis appartient à l'utilisateur connecté
  const isCurrentUserReview = () => {
    // Vérifier si nous avons un userDisplayName spécifique indiquant que c'est l'utilisateur actuel
    return review.userDisplayName === 'Vous';
  };
  
  // Déterminer le nom d'affichage de l'utilisateur
  const getUserIdentifier = () => {
    // IMPORTANT: Déboguer toutes les valeurs qui pourraient contenir le nom
    console.log('Détail des données utilisateur pour l\'avis', review.id, {
      userDisplayName: review.userDisplayName,
      userId: typeof review.user === 'string' ? review.user : review.user?.id,
      userObject: typeof review.user !== 'string' ? {
        firstName: review.user?.firstName,
        lastName: review.user?.lastName,
        prenom: review.user?.prenom,
        nom: review.user?.nom
      } : 'N/A'
    });
    
    // 1. PRIORITÉ ABSOLUE: Si c'est l'avis de l'utilisateur connecté, toujours afficher "Vous"
    if (isCurrentUserReview()) {
      return 'Vous';
    }
    
    // 2. PRIORITÉ HAUTE: Si userDisplayName est défini et non vide, l'utiliser TOUJOURS
    // Sauf si c'est exactement "Client" (ancien fallback)
    if (review.userDisplayName && review.userDisplayName.trim() !== '' && review.userDisplayName !== 'Client') {
      return review.userDisplayName;
    }
    
    // 3. PRIORITÉ MOYENNE: Essayer d'extraire le prénom et nom de l'objet utilisateur
    const user = review.user;
    if (typeof user !== 'string' && user) {
      const firstName = user.firstName || user.prenom;
      const lastName = user.lastName || user.nom;
      
      if (firstName && firstName.trim() !== '') {
        const lastInitial = lastName && lastName.trim() !== '' ? ` ${lastName.charAt(0)}.` : '';
        return `${firstName}${lastInitial}`;
      }
    }
    
    // 4. FALLBACK: Utiliser simplement l'initiale ou un espace réservé générique
    return 'A.'; // Utiliser une initiale générique plutôt que 'Client'
  };
  
  // Utiliser l'identifiant généré
  const userName = getUserIdentifier();
  
  // Log final pour vérifier quel nom sera affiché
  console.log(`\u{1F4AC} AFFICHAGE FINAL pour l'avis ${review.id}: "${userName}"`);

  // Force directement userDisplayName s'il existe, pour contourner tout problème dans getUserIdentifier
  const forceDisplayName = review.userDisplayName === 'Vous' ? 'Vous' : 
                        (review.userDisplayName && review.userDisplayName !== 'Client' ? 
                         review.userDisplayName : userName);

  return (
    <div className="border-b border-[#2A4D44] py-6 last:border-b-0 mb-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#1A3D34] flex items-center justify-center text-white font-semibold">
              {forceDisplayName.charAt(0)}
            </div>
          </div>
          <div>
            <div className="font-medium text-white">{forceDisplayName}</div>
            <div className="flex items-center mt-1">
              <StarRating rating={review.rating} size="sm" />
              <span className="ml-2 font-semibold text-[#EFC368]">{review.reviewTitle}</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1 md:mt-0">
          {formattedDate}
        </div>
      </div>
      
      {review.reviewContent && (
        <div className="mb-4 text-sm text-white bg-[#003B36] p-4 rounded-md">
          {review.reviewContent}
        </div>
      )}
      
      <div className="flex items-center text-xs mt-2">
        <div className="flex items-center flex-wrap gap-2">
          {review.isVerifiedPurchase && (
            <span className="px-2 py-1 bg-[#1A3D34] text-[#4ADE80] border border-[#4ADE80] rounded-full text-xs font-medium">
              Achat vérifié
            </span>
          )}
          {!review.isApproved && (
            <span className="px-2 py-1 bg-[#1A3D34] text-[#EFC368] border border-[#EFC368] rounded-full text-xs font-medium">
              En attente d&apos;approbation
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;
