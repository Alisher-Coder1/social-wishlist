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
  reserved?: boolean;
  reserved_at?: string | null;
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

  useEffect(() => {
    async function fetchGifts() {
      if (!id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("gifts")
        .select(
          "id, title, price, url, image, created_at, reserved, reserved_at",
        )
        .eq("wishlist_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error.message);
        setLoading(false);
        return;
      }

      setGifts((data as Gift[]) || []);
      setLoading(false);
    }

    fetchGifts();
  }, [id]);

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

  async function addGift(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanTitle = title.trim();
    const cleanUrl = url.trim();
    const cleanImage = image.trim();

    if (!cleanTitle) return;

    setAddingGift(true);

    const payload = {
      wishlist_id: id,
      title: cleanTitle,
      url: cleanUrl || null,
      price: price ? Number(price) : null,
      image: cleanImage || null,
    };

    const { data, error } = await supabase
      .from("gifts")
      .insert(payload)
      .select("id, title, price, url, image, created_at, reserved, reserved_at")
      .single();

    if (error) {
      alert(error.message);
      setAddingGift(false);
      return;
    }

    if (data) {
      setGifts((prev) => [data as Gift, ...prev]);
    }

    setTitle("");
    setUrl("");
    setPrice("");
    setImage("");
    setAddingGift(false);
  }

  async function reserveGift(giftId: string) {
    const reservedAt = new Date().toISOString();

    const { error } = await supabase
      .from("gifts")
      .update({
        reserved: true,
        reserved_at: reservedAt,
      })
      .eq("id", giftId);

    if (error) {
      alert(error.message);
      return;
    }

    setGifts((prev) =>
      prev.map((gift) =>
        gift.id === giftId
          ? { ...gift, reserved: true, reserved_at: reservedAt }
          : gift,
      ),
    );
  }

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
          <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Add gift
            </h2>

            <form onSubmit={addGift} className="grid gap-3">
              <input
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500"
                placeholder="Title"
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
                      <h3 className="min-h-56px text-lg font-semibold text-gray-900">
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

                        <button
                          type="button"
                          onClick={() => reserveGift(gift.id)}
                          disabled={Boolean(gift.reserved)}
                          className="rounded-2xl bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {gift.reserved ? "Reserved" : "Reserve"}
                        </button>
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
