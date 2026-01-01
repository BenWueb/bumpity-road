"use client";

import { GuestbookCreateInput } from "@/types/guestbook";
import { COLOR_OPTIONS, DEFAULT_COLOR, ColorValue } from "@/lib/guestbook-constants";
import { Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Props = {
  onSubmit: (input: GuestbookCreateInput) => Promise<boolean>;
  id?: string;
};

export function GuestbookForm({ onSubmit, id }: Props) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState<ColorValue>(DEFAULT_COLOR);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const success = await onSubmit({
        name: name.trim(),
        message: message.trim(),
        color,
      });

      if (success) {
        setName("");
        setMessage("");
        setColor(DEFAULT_COLOR);
      } else {
        setError("Failed to sign guestbook");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id={id} className="lg:sticky lg:top-6 lg:self-start scroll-mt-4">
      <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-purple-50 dark:from-violet-950/30 dark:via-background dark:to-purple-950/20" />
        <div className="relative p-6">
          <h2 className="mb-4 text-lg font-semibold">Sign the Guestbook</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                maxLength={100}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium">
                Message
              </label>
              <div className="relative">
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave a message..."
                  required
                  rows={4}
                  maxLength={500}
                  className="w-full resize-none rounded-md border bg-background px-3 pb-6 pt-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="pointer-events-none absolute bottom-2 right-2 text-xs text-muted-foreground">
                  {message.length}/500
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Card Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${opt.bg} ${
                      color === opt.value
                        ? "ring-2 ring-ring ring-offset-2"
                        : "hover:scale-110"
                    }`}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <button
              type="submit"
              disabled={submitting || !name.trim() || !message.trim()}
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Signing..." : "Sign Guestbook"}
            </button>
            <p className="text-sm text-muted-foreground">
              Want to add a photo or a longer message? Consider adding a
              <Link href="/blog" className="text-blue-600 hover:text-primary/90">
                {" "}
                Blog post
              </Link>{" "}
              instead!
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

