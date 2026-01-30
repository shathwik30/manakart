"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button, Divider } from "@/components/ui";

const features = [
  {
    title: "Exquisite Craftsmanship",
    description:
      "Each piece is meticulously crafted by skilled artisans using time-honored techniques.",
  },
  {
    title: "Premium Materials",
    description:
      "We source only the finest fabrics and materials from renowned mills across the world.",
  },
  {
    title: "Timeless Design",
    description:
      "Our designs transcend trends, offering enduring elegance for generations.",
  },
];

export function AboutPreview() {
  return (
    <section className="section-lg bg-white overflow-hidden">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
                alt="Craftsmanship"
                fill
                className="object-cover"
              />
            </div>

            {}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -bottom-8 -right-8 lg:-right-12 bg-charcoal-900 text-cream-100 p-8 rounded-2xl max-w-[280px] shadow-elegant"
            >
              <p className="font-display text-4xl mb-2">25+</p>
              <p className="text-charcoal-300">
                Years of excellence in luxury fashion
              </p>
            </motion.div>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="overline text-gold-600 mb-4">Our Heritage</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-900 mb-6">
              The Art of
              <br />
              Timeless Elegance
            </h2>

            <p className="text-charcoal-600 text-lg leading-relaxed mb-10">
              At Succession, we believe that true style is eternal. Our
              collections are designed for those who appreciate the finer things
              in life — individuals who understand that elegance is not about
              following trends, but about cultivating a refined sensibility that
              stands the test of time.
            </p>

            <Divider variant="gold" className="mb-10" />

            {}
            <div className="space-y-8 mb-10">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-lg text-gold-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-charcoal-900 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-charcoal-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link href="/about">
              <Button
                variant="secondary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Discover Our Story
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}