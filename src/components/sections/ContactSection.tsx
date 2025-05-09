'use client';

import React from 'react';
import ContactForm from '@/components/Contact/ContactForm';
import { motion } from 'framer-motion';

const ContactSection = () => {
  return (
    <section className="py-16 bg-[#01333f] relative overflow-hidden">
      {/* Séparateur avec la section précédente */}
      <div className="absolute top-0 left-0 right-0 h-px w-full bg-gradient-to-r from-transparent via-[#126E62]/50 to-transparent"></div>
      <div className="absolute top-0 left-0 right-0 w-full h-4 bg-gradient-to-b from-black/5 to-transparent"></div>
      {/* Éléments décoratifs en arrière-plan */}
      <div className="absolute inset-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        {/* Motif de cercles décoratifs */}
        <div className="absolute top-10 right-20 w-40 h-40 rounded-full border border-white/20"></div>
        <div className="absolute bottom-20 left-10 w-60 h-60 rounded-full border border-white/20"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full border border-white/20"></div>
        
        {/* Lignes diagonales */}
        <div className="absolute top-0 left-1/4 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-0 right-1/4 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              className="flex items-center justify-center mb-2"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-1.5 h-8 bg-[#004942] rounded-full mr-3"></div>
              <motion.h2 
                className="text-3xl font-bold text-white inline-block relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Contact & Feedback
              </motion.h2>
            </motion.div>
            <motion.p 
              className="text-white/80 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Une question, un commentaire ou une suggestion ? Nous sommes à votre écoute !
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <ContactForm />
          </motion.div>
          
          <motion.div 
            className="mt-8 text-center text-white/60 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <p>Vous pouvez également nous contacter directement à <a href="mailto:contact@chanvre-vert.fr" className="text-[#EFC368] hover:underline hover:brightness-110 transition-all">contact@chanvre-vert.fr</a></p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
