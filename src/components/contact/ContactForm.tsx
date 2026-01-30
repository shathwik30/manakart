"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button, Input, Divider } from "@/components/ui";
import { isValidEmail } from "@/lib/utils";
import toast from "react-hot-toast";

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please provide your name");
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Kindly enter a valid email address");
      return;
    }

    if (!form.message.trim()) {
      toast.error("Share your message with us");
      return;
    }

    setIsLoading(true);

    
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Your inquiry has been submitted successfully.");
    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-soft-md">
      <h2 className="font-display text-xl text-charcoal-900 mb-6">
        Share Your Inquiry
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            variant="luxury"
            disabled={isLoading}
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            variant="luxury"
            disabled={isLoading}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Phone (Optional)"
            placeholder="9876543210"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
            variant="luxury"
            disabled={isLoading}
          />
          <Input
            label="Subject"
            placeholder="How may we assist you?"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            variant="luxury"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-charcoal-700">
            Message
          </label>
          <textarea
            placeholder="Please share additional details..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            disabled={isLoading}
            rows={6}
            className="w-full px-5 py-4 bg-cream-50 border-0 border-b-2 border-charcoal-200 text-charcoal-900 placeholder:text-charcoal-400 rounded-none transition-all duration-300 focus:bg-white focus:border-gold-500 focus:outline-none resize-none"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          rightIcon={<Send className="w-4 h-4" />}
        >
          Submit Inquiry
        </Button>
      </form>
    </div>
  );
}