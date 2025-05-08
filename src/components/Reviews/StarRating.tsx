import React from 'react';
import StarIcon from './StarIcon';

type StarRatingProps = {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onChange?: (rating: number) => void;
  maxStars?: number;
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'md',
  editable = false,
  onChange,
  maxStars = 5,
}) => {
  // Classes selon la taille
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const wrapperClasses = {
    sm: 'space-x-0.5',
    md: 'space-x-1',
    lg: 'space-x-2',
  };

  const handleClick = (index: number) => {
    if (editable && onChange) {
      onChange(index);
    }
  };

  return (
    <div className={`flex items-center ${wrapperClasses[size]}`}>
      {Array.from({ length: maxStars }).map((_, index) => (
        <button
          key={index}
          type="button"
          className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform' : ''} text-amber-400`}
          onClick={() => handleClick(index + 1)}
          aria-label={`${index + 1} étoile${index > 0 ? 's' : ''}`}
          disabled={!editable}
        >
          <StarIcon
            filled={index < Math.round(rating)}
            className={sizeClasses[size]}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
