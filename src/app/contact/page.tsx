'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulation d'envoi - remplacer par une vraie API call
    try {
      // Simule un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form data submitted:', formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-emerald-800">Contactez Chanvre Vert</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Nos Coordonnées</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-emerald-600">Adresse</h3>
              <p className="mt-1">123 Avenue du Chanvre<br />75000 Paris, France</p>
            </div>
            
            <div>
              <h3 className="font-medium text-emerald-600">Email</h3>
              <p className="mt-1">contact@chanvre-vert.fr</p>
            </div>
            
            <div>
              <h3 className="font-medium text-emerald-600">Téléphone</h3>
              <p className="mt-1">+33 1 23 45 67 89</p>
            </div>
            
            <div>
              <h3 className="font-medium text-emerald-600">Horaires</h3>
              <p className="mt-1">Du lundi au vendredi : 9h - 18h<br />Samedi : 10h - 16h</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Formulaire de Contact</h2>
          
          {submitStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              Une erreur s'est produite lors de l'envoi de votre message. Veuillez réessayer ultérieurement.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nom
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1">
                Sujet
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Sélectionnez un sujet</option>
                <option value="question">Question sur un produit</option>
                <option value="order">Suivi de commande</option>
                <option value="return">Retour produit</option>
                <option value="other">Autre demande</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-medium rounded-md hover:from-emerald-700 hover:to-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-70"
            >
              {submitting ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
