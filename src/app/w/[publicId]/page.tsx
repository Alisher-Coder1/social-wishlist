import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Gift = {
  id: string;
  title: string;
  price: number | null;
  url: string | null;
  image: string | null;
  reserved?: boolean | null;
};

export default async function PublicWishlistPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  const { data: wishlist, error: wishlistError } = await supabase
    .from("wishlists")
    .select("id, title, description, public_id")
    .eq("public_id", publicId)
    .single();

  if (wishlistError || !wishlist) {
    notFound();
  }

  const { data: gifts, error: giftsError } = await supabase
    .from("gifts")
    .select("id, title, price, url, image, reserved")
    .eq("wishlist_id", wishlist.id)
    .order("created_at", { ascending: false });

  if (giftsError) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">{wishlist.title}</h1>
          <p className="mt-2 text-sm text-red-600">Failed to load gifts.</p>
        </div>
      </main>
    );
  }

  const safeGifts = (gifts ?? []) as Gift[];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">{wishlist.title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {wishlist.description || "Public wishlist"}
          </p>
          <p className="mt-4 text-xs text-gray-500">
            Shared wishlist page. Friends can view gifts and reserve them.
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Gifts</h2>
          <span className="text-sm text-gray-500">{safeGifts.length} items</span>
        </div>

        {safeGifts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500">
            No gifts yet.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {safeGifts.map((gift) => (
              <div
                key={gift.id}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
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
                      disabled={Boolean(gift.reserved)}
                      className="rounded-2xl bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {gift.reserved ? "Reserved" : "Reserve"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/auth/login"
            className="text-sm text-gray-500 underline-offset-4 hover:underline"
          >
            Sign in to create your own wishlist
          </Link>
        </div>
      </div>
    </main>
  );
}