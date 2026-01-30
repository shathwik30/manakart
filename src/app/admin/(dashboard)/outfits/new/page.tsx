import OutfitForm from "@/components/admin/OutfitForm";

export const metadata = {
  title: "Create New Outfit | Admin",
  description: "Create a new outfit for the store",
};

export default function NewOutfitPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Create New Outfit</h1>
        <p className="text-[#666] mt-1">Add a new outfit to your collection</p>
      </div>

      <OutfitForm />
    </div>
  );
}
