"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Utiliser l'API de contact
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du message');
      }
      
      // Réinitialiser le formulaire après envoi réussi
      setName('');
      setEmail('');
      setMessage('');
      setSuccess(true);
      
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'envoi de votre message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#004942] p-6 rounded-lg border border-[#126E62]/30 shadow-xl">
        <div className="flex items-center justify-center mb-4 text-[#EFC368]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white font-medium text-center mb-4">
          Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.
        </p>
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 bg-[#EFC368] text-black border-[#2A4D44] hover:bg-[#2A4D44] transition-all duration-300" 
            onClick={() => setSuccess(false)}
          >
            Envoyer un nouveau message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[#004942] p-6 rounded-lg border border-[#126E62]/30 shadow-xl">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2 text-white">
          Votre nom
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Entrez votre nom"
          className="w-full p-3 rounded-md bg-[#003B36] text-white border border-[#2A4D44] placeholder-gray-400 focus:ring-2 focus:ring-[#EFC368] focus:border-transparent focus:outline-none transition-all duration-200"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
          Votre email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Entrez votre adresse email"
          className="w-full p-3 rounded-md bg-[#003B36] text-white border border-[#2A4D44] placeholder-gray-400 focus:ring-2 focus:ring-[#EFC368] focus:border-transparent focus:outline-none transition-all duration-200"
          required
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2 text-white">
          Votre message
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Comment pouvons-nous vous aider ?"
          rows={4}
          maxLength={1000}
          className="bg-[#003B36] text-white border border-[#2A4D44] placeholder-gray-400 focus:ring-2 focus:ring-[#EFC368] focus:border-transparent focus:outline-none transition-all duration-200 p-3"
          required
        />
        <p className="text-xs text-white/60 mt-2 flex justify-between items-center">
          <span>Soyez aussi descriptif que possible</span>
          <span>{1000 - message.length} caractères restants</span>
        </p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-900/70 border border-red-700 rounded-md text-white text-sm shadow-md">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-center pt-2">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#EFC368] text-black hover:bg-[#EFC368]/90 font-bold px-6 py-2.5 rounded-md transition-all duration-300 flex items-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Envoi en cours...
            </>
          ) : (
            'Envoyer mon message'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;
