import React from 'react';
import { PromoResult } from '../types';

interface Props {
  promoCode: string;
  setPromoCode: (code: string) => void;
  onApply: (e: React.FormEvent) => void;
  onCancel: () => void;
  promoResult: PromoResult;
  isApplying: boolean;
}

export default function PromoCodeForm({
  promoCode,
  setPromoCode,
  onApply,
  onCancel,
  promoResult,
  isApplying
}: Props) {
  return (
    <div className="mb-6 pb-6 border-b border-[#3A4A4F]">
      <h2 className="text-lg font-bold mb-3 text-[#F4F8F5]">Code Promotionnel</h2>
      {!promoResult.applied ? (
        <form onSubmit={onApply} className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={e => setPromoCode(e.target.value)}
            placeholder="Entrez votre code"
            className="flex-grow p-2 border rounded border-[#3A4A4F] bg-[#001E27] text-[#F4F8F5] text-sm"
            disabled={isApplying}
          />
          <button
            type="submit"
            disabled={isApplying || !promoCode.trim()}
            className="bg-[#EFC368] hover:bg-[#D3A74F] text-[#001E27] px-3 py-2 rounded-md font-medium transition-colors disabled:opacity-70 text-sm"
          >
            {isApplying ? 'Application...' : 'Appliquer'}
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-[#10B981] font-medium">✓ {promoResult.message.replace(/^Code "(.+?)" /, 'Code $1 ')}</span>
          <button onClick={onCancel} className="text-[#F4F8F5] hover:text-red-400 text-sm">Retirer</button>
        </div>
      )}
      {promoResult.message && !promoResult.applied && (
        <div className="mt-2 p-2 rounded text-sm bg-red-900 bg-opacity-20 text-red-400">{promoResult.message}</div>
      )}
    </div>
  );
}
