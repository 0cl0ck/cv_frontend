import React, { useState } from 'react';
import StarRating from './StarRating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';

type ReviewFormProps = {
  productId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Veuillez sélectionner une note');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('Soumission d\'un avis:', { productId, rating, content });
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          rating,
          reviewContent: content
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la soumission de l\'avis');
      }
      
      console.log('Avis soumis avec succès:', data);
      
      // Après soumission réussie, réinitialiser le formulaire et notifier le parent
      setRating(0);
      setContent('');
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Erreur lors de la soumission:', err);
      setError(err.message || 'Une erreur est survenue lors de la soumission de votre avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#004942] p-4 rounded-md">
        <p className="text-white font-medium">
          Merci pour votre avis ! Il sera visible après validation par notre équipe.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3 bg-transparent text-white border-[#2A4D44] hover:bg-[#2A4D44]" 
          onClick={() => setSuccess(false)}
        >
          Écrire un autre avis
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#004942] p-5 rounded-md">
      <div>
        <label htmlFor="rating" className="block text-sm font-medium mb-2 text-white">
          Votre note
        </label>
        <StarRating 
          rating={rating} 
          editable={true} 
          onChange={setRating}
          size="lg"
        />
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2 text-white">
          Votre avis (optionnel)
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          placeholder="Partagez votre expérience avec ce produit..."
          rows={4}
          maxLength={1000}
          className="bg-[#003B36] text-white border-[#2A4D44] placeholder-gray-400"
        />
        <p className="text-xs text-gray-300 mt-1">
          {1000 - content.length} caractères restants
        </p>
      </div>
      
      {error && (
        <div className="p-3 bg-red-900 border border-red-700 rounded-md text-white text-sm">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-end space-x-3">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-[#2A4D44] text-white hover:bg-[#2A4D44]"
          >
            Annuler
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting || !rating}
          className="bg-[#EFC368] text-black hover:bg-[#EFC368] font-bold"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Soumettre mon avis'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
