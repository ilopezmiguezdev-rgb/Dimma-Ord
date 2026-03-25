import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import OrderPdfDocument from '@/lib/pdf/OrderPdfDocument';

const usePdfDownload = (logoUrl, showCosts = true) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadOrderPdf = useCallback(async (order) => {
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <OrderPdfDocument order={order} logoUrl={logoUrl} showCosts={showCosts} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orden-servicio-${order.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [logoUrl, showCosts]);

  return { downloadOrderPdf, isGenerating };
};

export default usePdfDownload;
