import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

const qrcodeRegionId = "html5qr-code-full-region";

interface QrScannerPluginProps {
  fps?: number;
  qrbox?: number;
  aspectRatio?: number;
  disableFlip?: boolean;
  qrCodeSuccessCallback: (decodedText: string, result: any) => void;
  qrCodeErrorCallback?: (errorMessage: string) => void;
}

export function QrScannerPlugin(props: QrScannerPluginProps) {
  const { qrCodeSuccessCallback, qrCodeErrorCallback, fps = 10, qrbox = 250, aspectRatio, disableFlip = false } = props;
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Evitamos instanciar múltiples veces si Strict Mode está activo
    if (!scannerRef.current) {
      const config: any = {
        fps,
        qrbox,
        aspectRatio,
        disableFlip,
        videoConstraints: {
          facingMode: "environment",
        },
      };

      scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, false);
      scannerRef.current.render(qrCodeSuccessCallback, qrCodeErrorCallback);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        scannerRef.current = null;
      }
    };
  }, [qrCodeSuccessCallback, qrCodeErrorCallback, fps, qrbox, aspectRatio, disableFlip]);

  return <div id={qrcodeRegionId} className="w-full h-full border-none!" />;
}
