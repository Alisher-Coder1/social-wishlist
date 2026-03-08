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
      setLoading(true);

      const { data, error } = await supabase
        .from("gifts")
        .select("id, title, price, url, image")
        .eq("wishlist_id", id)
        .order("created_at", { ascending: true });

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
    const cleanUrl = url.trim();

    if (!cleanUrl.startsWith("http")) return;

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

      if (data.title) setTitle(data.title);
      if (data.image) setImage(data.image);
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
      .select("id, title, price, url, image")
      .single();

    if (error) {
      alert(error.message);
      setAddingGift(false);
      return;
    }

    if (data) {
      setGifts((prev) => [...prev, data as Gift]);
    }

    setTitle("");
    setUrl("");
    setPrice("");
    setImage("");
    setAddingGift(false);
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-4xl font-bold">Wishlist</h1>

        <form
          onSubmit={addGift}
          className="mb-8 max-w-2xl rounded-2xl border p-6"
        >
          <h2 className="mb-4 text-xl font-semibold">Add gift</h2>

          <div className="grid gap-3">
            <input
              className="w-full rounded-xl border p-3"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              className="w-full rounded-xl border p-3"
              placeholder="Product URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button
              type="button"
              onClick={fetchPreview}
              disabled={previewLoading || !url.trim()}
              className="w-fit rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {previewLoading ? "Loading preview..." : "Fetch preview"}
            </button>
            <input
              className="w-full rounded-xl border p-3"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <input
              className="w-full rounded-xl border p-3"
              placeholder="Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />

            <button
              type="submit"
              disabled={addingGift}
              className="mt-2 w-fit rounded-xl border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              {addingGift ? "Adding..." : "Add gift"}
            </button>
          </div>
        </form>

        <div className="max-w-5xl">
          {loading ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-gray-500">
              Loading gifts...
            </div>
          ) : gifts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-sm text-gray-500">
              No gifts yet. Add your first gift above.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {gifts.map((gift) => (
                <div
                  key={gift.id}
                  className="overflow-hidden rounded-2xl border bg-white"
                >
                  <div className="relative aspect-4/3 w-full bg-gray-100">
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

                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{gift.title}</h3>

                    <div className="mt-2 text-sm text-gray-600">
                      {gift.price !== null
                        ? `$${gift.price}`
                        : "Price not specified"}
                    </div>

                    <div className="mt-4 flex gap-2">
                      {gift.url ? (
                        <a
                          href={gift.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          Open product
                        </a>
                      ) : (
                        <span className="rounded-xl border px-3 py-2 text-sm text-gray-400">
                          No link
                        </span>
                      )}

                      <button
                        type="button"
                        className="rounded-xl border px-3 py-2 text-sm text-gray-400"
                        disabled
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
