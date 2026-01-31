import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { CollectionGrid } from "@/components/collections/CollectionGrid";
import { CollectionHero } from "@/components/collections/CollectionHero";
import { outfitsApi, Outfit } from "@/lib/api";
interface PageProps {
  params: Promise<{ type: string }>;
}
const collectionData: Record<
  string,
  { title: string; subtitle: string; description: string; image: string }
> = {
  gentlemen: {
    title: "Gentlemen",
    subtitle: "Refined Masculinity",
    description:
      "Discover impeccably tailored pieces that embody timeless sophistication. Each outfit is crafted for the modern gentleman who values quality and elegance.",
    image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1920"
  },
  lady: {
    title: "Lady",
    subtitle: "Effortless Grace",
    description:
      "Elegant ensembles designed for the modern woman. Our collection celebrates femininity with understated luxury and timeless appeal.",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1920"
  },
  couple: {
    title: "Couple",
    subtitle: "Harmonious Elegance",
    description:
      "Coordinated looks for couples who appreciate the art of dressing together. Make a statement with perfectly matched ensembles.",
    image: "https://images.unsplash.com/photo-1529665730773-0c440c0e0d0e?w=1920"
  },
};
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const collection = collectionData[type.toLowerCase()];
  if (!collection) {
    return { title: "Collection Not Found" };
  }
  return {
    title: `${collection.title} Collection`,
    description: collection.description,
  };
}
export default async function CollectionPage({ params }: PageProps) {
  const { type } = await params;
  const collectionType = type.toLowerCase();
  const collection = collectionData[collectionType];
  if (!collection) {
    notFound();
  }
  let outfits: Outfit[] = [];
  try {
    const data = await outfitsApi.getAll({
      type: collectionType.toUpperCase(),
    });
    outfits = data.outfits;
  } catch (error) {
    console.error("Error fetching outfits:", error);
  }
  return (
    <>
      <Header />
      <CollectionHero
        title={collection.title}
        subtitle={collection.subtitle}
        description={collection.description}
        image={collection.image}
      />
      <CollectionGrid outfits={outfits} collectionType={collectionType} />
      <Footer />
    </>
  );
}
