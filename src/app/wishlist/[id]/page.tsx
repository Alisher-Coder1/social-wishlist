"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Gift = {
  id: string;
  title: string;
  price: number | null;
  url: string | null;
  image: string | null;
  created_at?: string;
  // reservation fields intentionally omitted – owner must not see them
};

type RealtimePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Partial<Gift> & { id?: string }; // id is required for most operations
  old: Partial<Gift> & { id?: string };
};

export default function WishlistPage() {
  const params = useParams();
  const id = params.id as string;

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [addingGift, setAddingGift] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ------------------------------------------------------------
  // 1. Fetch initial gifts
  // ------------------------------------------------------------
  useEffect(() => {
    async function fetchGifts() {
      if (!id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("gifts")
        .select("id, title, price, url, image, created_at") // no reservation fields
        .eq("wishlist_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load gifts:", error.message);
        setLoading(false);
        return;
      }

      setGifts((data as Gift[]) || []);
      setLoading(false);
    }

    fetchGifts();
  }, [id]);

  // ------------------------------------------------------------
  // 2. Realtime subscription (with safety guards)
  // ------------------------------------------------------------
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`wishlist-owner-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gifts",
          filter: `wishlist_id=eq.${id}`,
        },
        (payload: RealtimePayload) => {
          setGifts((prev) => {
            // INSERT
            if (payload.eventType === "INSERT") {
              if (!payload.new?.id) return prev; // safety guard
              const incoming = payload.new as Gift;
              const exists = prev.some((gift) => gift.id === incoming.id);
              if (exists) return prev;
              return [incoming, ...prev];
            }

            // UPDATE
            if (payload.eventType === "UPDATE") {
              if (!payload.new?.id) return prev; // safety guard
              const incoming = payload.new as Gift;
              return prev.map((gift) =>
                gift.id === incoming.id ? { ...gift, ...incoming } : gift,
              );
            }

            // DELETE
            if (payload.eventType === "DELETE") {
              if (!payload.old?.id) return prev; // safety guard
              return prev.filter((gift) => gift.id !== payload.old!.id);
            }

            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // ------------------------------------------------------------
  // 3. Preview product metadata from URL
  // ------------------------------------------------------------
  async function fetchPreview() {
    let cleanUrl = url.trim();

    if (!cleanUrl) return;

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
      setUrl(cleanUrl);
    }

    try {
      setPreviewLoading(true);

      const res = await fetch("/api/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await res.json();

      if (data.title && !title.trim()) {
        setTitle(data.title);
      }

      if (data.image && !image.trim()) {
        setImage(data.image);
      }
    } catch (error) {
      console.error("Preview failed:", error);
    } finally {
      setPreviewLoading(false);
    }
  }

  // ------------------------------------------------------------
  // 4. Add a new gift (owner only)
  // ------------------------------------------------------------
  async function addGift(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanTitle = title.trim();
    const cleanUrl = url.trim() || null;
    const cleanImage = image.trim() || null;
    const cleanPrice = price.trim();

    if (!cleanTitle) return; // prevent empty title

    setAddingGift(true);

    const payload = {
      wishlist_id: id,
      title: cleanTitle,
      url: cleanUrl,
      image: cleanImage,
      price: cleanPrice ? Number(cleanPrice) : null,
      // reserved / reserved_at are omitted – table defaults handle them
    };

    const { error } = await supabase.from("gifts").insert(payload);

    if (error) {
      alert(error.message);
      setAddingGift(false);
      return;
    }

    // Clear form
    setTitle("");
    setUrl("");
    setPrice("");
    setImage("");
    setAddingGift(false);
  }

  // ------------------------------------------------------------
  // 5. Render
  // ------------------------------------------------------------
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Wishlist
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Add gifts, preview products, and manage reservations.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* Left column – add form */}
          <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Add gift
            </h2>

            <form onSubmit={addGift} className="grid gap-3">
              <input
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500"
                placeholder="Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <input
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500"
                placeholder="Product URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />

              <button
                type="button"
                onClick={fetchPreview}
                disabled={previewLoading}
                className="w-fit rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:opacity-60"
              >
                {previewLoading ? "Loading..." : "Fetch preview"}
              </button>

              <input
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <input
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500"
                placeholder="Image URL"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />

              <button
                type="submit"
                disabled={addingGift}
                className="mt-2 w-fit rounded-2xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
              >
                {addingGift ? "Adding..." : "Add gift"}
              </button>
            </form>
          </aside>

          {/* Right column – gift list */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Gifts</h2>
              <span className="text-sm text-gray-500">
                {loading ? "Loading..." : `${gifts.length} items`}
              </span>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500">
                Loading gifts...
              </div>
            ) : gifts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500">
                No gifts yet. Add your first gift on the left.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {gifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative h-52 w-full bg-gray-100">
                      {gift.image ? (
                        <Image
                          src={gift.image}
                          alt={gift.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="min-h-14 text-lg font-semibold text-gray-900">
                        {gift.title}
                      </h3>

                      <div className="mt-2 text-sm text-gray-600">
                        {gift.price !== null
                          ? `$${gift.price}`
                          : "Price not specified"}
                      </div>

                      <div className="mt-auto flex flex-wrap gap-2 pt-5">
                        {gift.url ? (
                          <a
                            href={gift.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-2xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                          >
                            Open product
                          </a>
                        ) : (
                          <span className="rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-400">
                            No link
                          </span>
                        )}
                        <span className="rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-400">
                          Reserved status hidden (surprise mode)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}