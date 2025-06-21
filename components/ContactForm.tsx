import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
        <p>Your message has been sent.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 border rounded-lg bg-white shadow">
      <div>
        <label htmlFor="name" className="block mb-1 font-medium">Name</label>
        <Input id="name" name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="email" className="block mb-1 font-medium">Email</label>
        <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="message" className="block mb-1 font-medium">Message</label>
        <Textarea id="message" name="message" value={form.message} onChange={handleChange} required rows={4} />
      </div>
      <Button type="submit" className="w-full">Send Message</Button>
    </form>
  );
} 