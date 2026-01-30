"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { isValidEmail } from "@/lib/utils";
import toast from "react-hot-toast";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error("Kindly enter a valid email address");
      return;
    }

    setIsSubmitting(true);


    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Thank you for joining the Inner Circle");
  };

  return (
    <section className="section bg-cream-100">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-white rounded-3xl p-10 lg:p-16 shadow-elegant overflow-hidden"
        >
          {}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gold-100 to-transparent rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cream-300 to-transparent rounded-full blur-2xl opacity-50" />

          <div className="relative text-center">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8"
              >
                <div className="w-20 h-20 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-gold-600" />
                </div>
                <h3 className="font-display text-2xl lg:text-3xl text-charcoal-900 mb-4">
                  You're on the List
                </h3>
                <p className="text-charcoal-600 max-w-md mx-auto">
                  Thank you for subscribing. You'll be the first to know about
                  new collections, exclusive events, and special offers.
                </p>
              </motion.div>
            ) : (
              <>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="overline text-gold-600 mb-4"
                >
                  Stay Connected
                </motion.p>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="font-display text-2xl lg:text-4xl text-charcoal-900 mb-4"
                >
                  Join the Inner Circle
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-charcoal-600 mb-10 max-w-lg mx-auto"
                >
                  Subscribe to receive exclusive previews of new collections,
                  style inspiration, and member-only offers.
                </motion.p>

                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                >
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      variant="luxury"
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Subscribe
                  </Button>
                </motion.form>

                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-charcoal-400 mt-4"
                >
                  By subscribing, you agree to our Privacy Policy.
                </motion.p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}