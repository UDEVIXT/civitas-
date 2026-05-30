import { Suspense } from "react";
import { UploadINEPageContent } from "./UploadINEPageContent";

export default function UploadINEPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Cargando...</div>}>
      <UploadINEPageContent />
    </Suspense>
  );
}
