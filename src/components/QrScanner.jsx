import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { toast } from "@/components/ui/toaster";

const qrScannerId = "html5-qr-scanner-viewfinder";

const QrScanner = ({ isOpen, onClose, onScanSuccess, onScanFailure }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const scannerContainer = document.getElementById(qrScannerId);
    if (!scannerContainer) {
        console.error(`Element with id ${qrScannerId} not found.`);
        return;
    }

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(qrScannerId, {
        verbose: false
      });
    }
    const html5QrCode = scannerRef.current;

    const successCallback = (decodedText, decodedResult) => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop()
          .then(() => {
            onScanSuccess(decodedText, decodedResult);
          })
          .catch(err => {
            console.error("Failed to stop scanner after success.", err);
            onScanSuccess(decodedText, decodedResult);
          });
      }
    };

    const errorCallback = (errorMessage) => {
      onScanFailure(errorMessage);
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    if (!html5QrCode.isScanning) {
      html5QrCode.start({ facingMode: "environment" }, config, successCallback, errorCallback)
        .catch(err => {
          console.error("Unable to start scanning.", err);
          toast({
            title: "Error de Cámara",
            description: "No se pudo acceder a la cámara. Verifique los permisos del navegador.",
            variant: "destructive"
          });
          onClose();
        });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => {
          console.warn("Error stopping the scanner on cleanup.", err);
        });
      }
    };
  }, [isOpen, onClose, onScanSuccess, onScanFailure]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-50 dark:bg-slate-900 shadow-2xl rounded-xl border dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-sky-600">Escanear Código QR</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Apunta la cámara al código QR del equipo.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full rounded-lg overflow-hidden">
          {isOpen && <div id={qrScannerId} style={{ width: '100%' }}></div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" /> Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrScanner;