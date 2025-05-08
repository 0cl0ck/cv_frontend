import React from 'react';
import ReviewItem, { ReviewType } from './ReviewItem';

type ReviewsListProps = {
  reviews: ReviewType[];
  loading?: boolean;
};

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, loading = false }) => {
  if (loading) {
    return (
      <div className="py-6 text-center text-gray-300">
        <div className="inline-block animate-pulse">
          <svg className="w-8 h-8 mr-2 text-[#1A3D34]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div className="mt-2">Chargement des avis...</div>
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="py-6 text-center text-gray-300 bg-[#132E27] rounded-lg p-6">
        <svg className="w-12 h-12 mx-auto mb-3 text-[#2A4D44]" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
        </svg>
        <p>Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 divide-y divide-[#2A4D44]">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
};

export default ReviewsList;
