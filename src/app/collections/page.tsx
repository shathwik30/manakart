import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header, Footer } from "@/components/layout";
import { ArrowRight } from "lucide-react";
export const metadata: Metadata = {
  title: "Collections",
  description: "Explore our curated collections of luxury fashion for Gentlemen, Lady, and Couples.",
};
const collections = [
  {
    id: "gentlemen",
    title: "Gentlemen",
    subtitle: "Refined Masculinity",
    description: "Discover impeccably tailored pieces that embody timeless sophistication and modern elegance.",
    image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1200",
    href: "/collections/gentlemen",
  },
  {
    id: "lady",
    title: "Lady",
    subtitle: "Effortless Grace",
    description: "Elegant ensembles designed for the modern woman who appreciates understated luxury.",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200",
    href: "/collections/lady",
  },
  {
    id: "couple",
    title: "Couple",
    subtitle: "Harmonious Elegance",
    description: "Coordinated looks for couples who appreciate the art of dressing together.",
    image: "https://images.unsplash.com/photo-1529665730773-0c440c0e0d0e?w=1200",
    href: "/collections/couple",
  },
];
export default function CollectionsPage() {
  return (
    <>
      <Header />
      <section className="pt-32 pb-16 bg-cream-100">
        <div className="container-luxury text-center">
          <p className="overline text-gold-600 mb-4">Our Collections</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal-900 mb-6">
            Curated Elegance
          </h1>
          <p className="text-charcoal-600 text-lg max-w-2xl mx-auto">
            Each collection is thoughtfully designed to help you express your
            unique sense of style with timeless sophistication.
          </p>
        </div>
      </section>
      <section className="pb-20 bg-cream-100">
        <div className="container-luxury">
          <div className="space-y-20">
            {collections.map((collection, index) => (
              <Link
                key={collection.id}
                href={collection.href}
                className="group block"
              >
                <div
                  className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`relative aspect-[4/3] lg:aspect-[4/5] rounded-2xl overflow-hidden ${
                      index % 2 === 1 ? "lg:order-2" : ""
                    }`}
                  >
                    <Image
                      src={collection.image}
                      alt={collection.title}
                      fill
                      className="object-cover img-zoom"
                    />
                    <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/10 transition-colors duration-500" />
                  </div>
                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <p className="overline text-gold-600 mb-4">
                      {collection.subtitle}
                    </p>
                    <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-900 mb-6 group-hover:text-gold-600 transition-colors">
                      {collection.title}
                    </h2>
                    <p className="text-charcoal-600 text-lg mb-8 max-w-md">
                      {collection.description}
                    </p>
                    <div className="inline-flex items-center gap-2 text-charcoal-900 font-medium group-hover:text-gold-600 transition-colors">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}