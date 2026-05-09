import { MiBitacoraPage } from "@/features/mi-bitacora/components/mi-bitacora-page";

export default function MiBitacoraAccesosPage() {
  const residentUserId =
    process.env.NEXT_PUBLIC_RESIDENT_USER_ID ?? process.env.RESIDENT_USER_ID ?? "";

  return <MiBitacoraPage initialResidentUserId={residentUserId} />;
}
