import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import ReagentDeliveryPdfDocument from '@/lib/pdf/ReagentDeliveryPdfDocument';

const useReagentPdfDownload = (logoUrl) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadDeliveryPdf = useCallback(async (delivery) => {
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <ReagentDeliveryPdfDocument delivery={delivery} logoUrl={logoUrl} />
      ).toBlob();

      const dateStr = delivery.delivery_date || new Date().toISOString().split('T')[0];
      const clientSlug = (delivery.client_name || 'entrega').replace(/\s+/g, '-').toLowerCase();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `entrega-reactivos-${clientSlug}-${dateStr}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating reagent delivery PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [logoUrl]);

  return { downloadDeliveryPdf, isGenerating };
};

export default useReagentPdfDownload;
