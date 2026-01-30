import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Divider } from "@/components/ui";

export const metadata: Metadata = {
  title: "About Us",
  description: "Discover the story behind Succession - curating timeless elegance since 1999.",
};

export default function AboutPage() {
  return (
    <>
      <Header />

      {}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600"
            alt="Craftsmanship"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-charcoal-900/60" />
        </div>

        <div className="relative h-full container-luxury flex items-center justify-center text-center">
          <div className="max-w-2xl pt-20">
            <p className="overline text-gold-400 mb-4">Our Story</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6">
              The Art of Timeless Elegance
            </h1>
            <p className="text-cream-200 text-lg">
              Since 1999, we&apos;ve been curating exceptional pieces for those who
              appreciate the finer things in life.
            </p>
          </div>
        </div>
      </section>

      {}
      <section className="section bg-cream-100">
        <div className="container-narrow">
          <div className="prose prose-lg mx-auto text-center">
            <p className="text-charcoal-600 text-lg leading-relaxed mb-8">
              Succession was born from a simple belief: that true style
              transcends trends and seasons. Founded in Mumbai by a collective of
              designers and artisans, we set out to create a destination for
              those who seek clothing that tells a story.
            </p>
            <p className="text-charcoal-600 text-lg leading-relaxed mb-8">
              Every piece in our collection is carefully selected or designed
              with an unwavering commitment to quality, craftsmanship, and
              timeless appeal. We work with the finest mills and ateliers around
              the world to bring you garments that are meant to be treasured.
            </p>
            <p className="text-charcoal-600 text-lg leading-relaxed">
              Our philosophy is rooted in the idea that elegance is not about
              excess, but about restraint. It&apos;s about choosing pieces that
              speak softly but carry weight. It&apos;s about investing in quality
              over quantity, and in style that endures.
            </p>
          </div>
        </div>
      </section>

      {}
      <section className="section bg-white">
        <div className="container-luxury">
          <div className="text-center mb-16">
            <p className="overline text-gold-600 mb-4">Our Values</p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal-900">
              What We Stand For
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Exceptional Quality",
                description:
                  "We source only the finest materials and work with skilled artisans who share our commitment to excellence.",
              },
              {
                title: "Timeless Design",
                description:
                  "Our collections are designed to transcend trends, offering pieces that remain relevant season after season.",
              },
              {
                title: "Sustainable Practice",
                description:
                  "We believe in responsible fashion, creating pieces meant to last and minimizing our environmental footprint.",
              },
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-6">
                  <span className="font-display text-2xl text-gold-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-display text-xl text-charcoal-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-charcoal-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="section bg-charcoal-900">
        <div className="container-narrow text-center">
          <h2 className="font-display text-3xl md:text-4xl text-cream-100 mb-6">
            Experience the Difference
          </h2>
          <p className="text-charcoal-300 text-lg mb-8">
            Discover our curated collections and find pieces that speak to your
            sense of style.
          </p>
          
          <Link
            href="/collections"
            className="btn-gold inline-flex items-center gap-2"
          >
            Explore Collections
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}