
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { OutfitDetail } from "@/components/outfit/OutfitDetail";
import { outfitService } from "@/lib/services/outfit-service";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { outfit } = await outfitService.getOutfitBySlug(slug);
    if (!outfit) return { title: "Outfit Not Found" };

    return {
      title: outfit.title,
      description: outfit.description || `Discover ${outfit.title} - a curated outfit from Succession`,
    };
  } catch {
    return { title: "Outfit Not Found" };
  }
}

export default async function OutfitPage({ params }: PageProps) {
  const { slug } = await params;
  let outfit;
  try {
    const data = await outfitService.getOutfitBySlug(slug);
    outfit = data.outfit;
  } catch {
    notFound();
  }
  if (!outfit) {
    notFound();
  }
  return (
    <>
      <Header />
      <OutfitDetail outfit={outfit} />
      <Footer />
    </>
  );
}