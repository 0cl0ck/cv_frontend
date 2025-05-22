import React, { useEffect, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';
import { Button } from '@/components/ui/button';
import { ReviewType } from './ReviewItem';
import { secureLogger as logger } from '@/utils/logger';
import { httpClient } from '@/lib/httpClient';

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

type ProductReviewsProps = {
  productId: string;
  initialStats?: ReviewStats;
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, initialStats }) => {
  const { user } = useAuthContext();
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [stats, setStats] = useState<ReviewStats | undefined>(initialStats);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await httpClient.get(`/reviews?productId=${productId}`);
      logger.debug('Données détaillées des avis récupérées');
      
      // Utiliser les avis traités avec userDisplayName
      setReviews(data.reviews || []);
      setStats(data.stats || initialStats);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des avis:", error);
      setError("Impossible de charger les avis. Veuillez réessayer plus tard.");
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);
  
  // Calcul du pourcentage pour chaque note (pour la visualisation)
  const calculatePercentage = (count: number) => {
    if (!stats || stats.totalReviews === 0) return 0;
    return Math.round((count / stats.totalReviews) * 100);
  };
  
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    // Recharger les avis après soumission réussie
    logger.debug('Avis soumis avec succès, rechargement des avis...');
    // Léger délai pour permettre au backend de traiter la requête
    setTimeout(() => {
      fetchReviews();
    }, 500);
  };
  
  return (
    <div className="py-8 bg-[#004942] rounded-lg p-6 my-8">
      <div className={`${reviews.length > 0 ? 'border-b border-[#2A4D44] pb-8 mb-8' : ''}`}>
        <h2 className="text-2xl font-bold mb-6 text-white">Avis clients</h2>
        
        {/* Si nous avons des stats et des avis, afficher les statistiques */}
        {stats && stats.totalReviews > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Résumé des avis */}
            <div className="flex flex-col items-center bg-[#003B36] p-6 rounded-lg">
              <div className="text-5xl font-bold text-[#EFC368] mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <StarRating rating={stats.averageRating} size="lg" />
              <div className="text-sm text-gray-300 mt-3">
                {stats.totalReviews} avis
              </div>
            </div>
            
            {/* Distribution des notes */}
            <div className="flex-1 bg-[#003B36] p-6 rounded-lg">
              <h3 className="text-sm font-medium text-white mb-4">Distribution des notes</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center">
                    <div className="flex items-center mr-3 w-12">
                      <span className="text-sm font-medium text-white">{star}</span>
                      <svg
                        className="w-4 h-4 text-[#EFC368] ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1 h-3 bg-[#2A4D44] rounded-full">
                      <div
                        className="h-3 bg-[#EFC368] rounded-full"
                        style={{
                          width: `${calculatePercentage(stats.distribution[String(star) as keyof typeof stats.distribution])}%`,
                        }}
                      />
                    </div>
                    <div className="ml-3 w-12 text-right">
                      <span className="text-xs text-gray-300 font-medium">
                        {calculatePercentage(stats.distribution[String(star) as keyof typeof stats.distribution])}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !loading && reviews.length === 0 ? (
          /* Afficher ce message seulement s'il n'y a vraiment pas d'avis et qu'on ne charge pas */
          <div className="text-center py-6 text-gray-300 bg-[#003B36] rounded-lg p-6">
            <svg className="w-12 h-12 mx-auto mb-3 text-[#2A4D44]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
            </svg>
            <p>Aucun avis pour le moment</p>
          </div>
        ) : loading ? (
          /* Afficher l'indicateur de chargement quand on charge les données */
          <div className="text-center py-6 text-gray-300">
            <div className="inline-block animate-pulse">
              <svg className="w-8 h-8 mr-2 text-[#1A3D34]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="mt-2">Chargement des avis...</div>
          </div>
        ) : null}
        
        {/* Bouton pour ajouter un avis */}
        {!showReviewForm && user && (
          <div className="mt-8">
            <Button 
              onClick={() => setShowReviewForm(true)}
              className="bg-[#EFC368] text-black hover:bg-[#d5aa58] font-medium w-full md:w-auto"
            >
              Écrire un avis
            </Button>
          </div>
        )}
        
        {/* Formulaire d'avis */}
        {showReviewForm && (
          <div className="mt-8 bg-[#003B36] p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Partagez votre expérience</h3>
            <ReviewForm 
              productId={productId} 
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )}
        
        {!user && (
          <div className="mt-8 p-5 bg-[#003B36] rounded-lg text-white flex items-center">
            <svg className="w-6 h-6 mr-3 text-[#EFC368]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>Vous devez être connecté pour laisser un avis.</p>
          </div>
        )}
      </div>
      
      {/* Affichage des erreurs */}
      {error && (
        <div className="p-5 bg-red-900 border border-red-700 text-white rounded-lg my-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Liste des avis - seulement si nous avons des avis et pas d'erreur */}
      {!error && reviews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">
              {reviews.length} avis client{reviews.length > 1 ? 's' : ''}
            </h3>
          </div>
          
          <ReviewsList reviews={reviews} loading={false} />
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
