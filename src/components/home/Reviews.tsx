"use client";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Rating, Avatar, Divider } from "@/components/ui";
import { Review, ReviewStats } from "@/lib/api";
interface ReviewsProps {
  reviews: Review[];
  stats: ReviewStats;
}
export function Reviews({ reviews, stats }: ReviewsProps) {
  if (reviews.length === 0) return null;
  return (
    <section className="section bg-cream-200/50">
      <div className="container-luxury">
        {}
        <div className="text-center mb-12 lg:mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overline text-gold-600 mb-4"
          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-900 mb-6"
          >
            What Our Clients Say
          </motion.h2>
          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <Rating value={stats.averageRating} size="lg" />
            <span className="text-charcoal-600">
              {stats.averageRating.toFixed(1)} from {stats.totalReviews} reviews
            </span>
          </motion.div>
        </div>
        {}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {reviews.slice(0, 6).map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl p-8 shadow-soft-md hover:shadow-soft-lg transition-shadow duration-500"
    >
      {}
      <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mb-6">
        <Quote className="w-5 h-5 text-gold-600" />
      </div>
      {}
      <Rating value={review.rating} className="mb-4" />
      {}
      {review.comment && (
        <p className="text-charcoal-700 leading-relaxed mb-6">
          "{review.comment}"
        </p>
      )}
      <Divider variant="subtle" className="mb-6" />
      {}
      <div className="flex items-center gap-3">
        <Avatar name={review.userName} size="md" />
        <div>
          <p className="font-medium text-charcoal-900">{review.userName}</p>
          <p className="text-sm text-charcoal-500">Verified Buyer</p>
        </div>
      </div>
    </motion.div>
  );
}