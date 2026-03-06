"use client";
import { useRouter } from "next/navigation";
import { HomepageSectionForm } from "@/components/admin/HomepageSectionForm";

export default function NewHomepageSectionPage() {
  const router = useRouter();

  return (
    <HomepageSectionForm
      onSuccess={() => router.push("/admin/homepage")}
      onCancel={() => router.push("/admin/homepage")}
    />
  );
}
