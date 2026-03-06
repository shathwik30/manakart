"use client";
import { useState } from "react";
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
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit inquiry");
      }
      toast.success("Your inquiry has been submitted successfully.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit inquiry");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 transition-shadow disabled:bg-gray-100 disabled:text-gray-500";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">
        Send us a message
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={isLoading}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={isLoading}
              className={inputClasses}
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Phone (Optional)
            </label>
            <input
              type="text"
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              disabled={isLoading}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Subject
            </label>
            <input
              type="text"
              placeholder="How can we help?"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              disabled={isLoading}
              className={inputClasses}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Message
          </label>
          <textarea
            placeholder="Please share your inquiry..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            disabled={isLoading}
            rows={6}
            className={`${inputClasses} resize-none`}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 text-sm bg-gray-900 rounded-lg text-white hover:bg-gray-800 cursor-pointer disabled:opacity-60 transition-colors"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
