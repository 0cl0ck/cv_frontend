'use client';

import React, { useState } from 'react';
import { FAQItem, RichTextContent } from '@/types/product';
import { RichTextRenderer } from '@/components/RichTextRenderer/RichTextRenderer';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

interface FAQItemComponentProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItemComponent({ item, isOpen, onToggle }: FAQItemComponentProps) {
  return (
    <div className="border-b border-[#005965] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-4 px-6 flex items-center justify-between text-left hover:bg-[#003a42] transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-white font-medium pr-4">{item.question}</span>
        {isOpen ? (
          <IconChevronUp className="text-[#EFC368] flex-shrink-0" size={20} />
        ) : (
          <IconChevronDown className="text-[#EFC368] flex-shrink-0" size={20} />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 text-white/80">
              <RichTextRenderer content={item.answer as RichTextContent} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQAccordion({ items, className = '' }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className={`bg-[#00454f] rounded-lg border border-[#005965] ${className}`}>
      <h2 className="text-2xl font-bold text-white px-6 py-4 border-b border-[#005965]">
        Questions Fréquentes
      </h2>
      <div>
        {items.map((item, index) => (
          <FAQItemComponent
            key={item.id || index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
}
