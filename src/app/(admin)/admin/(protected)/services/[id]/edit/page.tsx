export const instant = false;

import OfferServiceEditor from "@/components/admin/offer-service-editor";
export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OfferServiceEditor serviceId={id} />;
}
