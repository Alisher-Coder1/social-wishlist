"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Wishlist = {
  id: string;
  title: string;
  description: string | null;
  public_id: string;
};

type Gift = {
  id: string;
  title: string;
  price: number | null;
  url: string | null;
  image: string | null;
  reserved: boolean | null;
  reserved_at: string | null;
  wishlist_id: string;
};

type Contribution = {
  id: string;
  gift_id: string;
  amount: number;
  created_at: string;
};

type ContributionTotals = Record<string, number>;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function PublicWishlistPage() {
  const { publicId } = useParams<{ publicId: string }>();

  // Wishlist state
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [contributions, setContributions] = useState<ContributionTotals>({});

  // UI states
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Reserve state
  const [reservingId, setReservingId] = useState<string | null>(null);

  // Contribution state
  const [contributingId, setContributingId] = useState<string | null>(null);
  const [contributionInputs, setContributionInputs] = useState<
    Record<string, string>
  >({});
  const [contributionErrors, setContributionErrors] = useState<
    Record<string, string>
  >({});

  // Memoized list of current gift IDs (used for contribution filtering)
  const giftIds = useMemo(() => gifts.map((g) => g.id), [gifts]);

  // ---------------------------------------------------------------------------
  // Data fetching (initial)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function loadWishlistAndGifts() {
      if (!publicId) return;

      setLoading(true);
      setNotFound(false);

      // 1. Fetch wishlist by public_id
      const { data: wishlistData, error: wishlistError } = await supabase
        .from("wishlists")
        .select("id, title, description, public_id")
        .eq("public_id", publicId)
        .maybeSingle();

      if (wishlistError || !wishlistData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setWishlist(wishlistData as Wishlist);

      // 2. Fetch gifts for this wishlist
      const { data: giftsData, error: giftsError } = await supabase
        .from("gifts")
        .select(
          "id, title, price, url, image, reserved, reserved_at, wishlist_id",
        )
        .eq("wishlist_id", wishlistData.id)
        .order("created_at", { ascending: false });

      if (giftsError) {
        console.error("Failed to fetch gifts:", giftsError.message);
        setGifts([]);
      } else {
        setGifts((giftsData as Gift[]) || []);
      }

      setLoading(false);
    }

    loadWishlistAndGifts();
  }, [publicId]);

  // ---------------------------------------------------------------------------
  // Fetch contributions for current gifts
  // ---------------------------------------------------------------------------

  const fetchContributions = useCallback(async (ids: string[]) => {
    if (!ids.length) return;

    const { data, error } = await supabase
      .from("contributions")
      .select("gift_id, amount")
      .in("gift_id", ids);

    if (error) {
      console.error("Failed to fetch contributions:", error.message);
      return;
    }

    const totals: ContributionTotals = {};
    for (const c of data ?? []) {
      totals[c.gift_id] = (totals[c.gift_id] || 0) + c.amount;
    }
    setContributions(totals);
  }, []);

  // Trigger contribution fetch whenever giftIds change
  useEffect(() => {
    if (!giftIds.length) return;

    fetchContributions(giftIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giftIds]);

  // ---------------------------------------------------------------------------
  // Realtime subscriptions
  // ---------------------------------------------------------------------------

  // Gifts subscription (filtered by wishlist_id)
  useEffect(() => {
    if (!wishlist?.id) return;

    const giftsChannel = supabase
      .channel(`public-wishlist-gifts-${wishlist.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gifts",
          filter: `wishlist_id=eq.${wishlist.id}`,
        },
        (payload) => {
          setGifts((prev) => {
            if (payload.eventType === "INSERT") {
              const newGift = payload.new as Gift;
              if (!newGift?.id) return prev;
              // Avoid duplicates (safety)
              if (prev.some((g) => g.id === newGift.id)) return prev;
              return [newGift, ...prev];
            }

            if (payload.eventType === "UPDATE") {
              const updated = payload.new as Gift;
              if (!updated?.id) return prev;
              return prev.map((g) =>
                g.id === updated.id ? { ...g, ...updated } : g,
              );
            }

            if (payload.eventType === "DELETE") {
              const deletedId = payload.old?.id as string | undefined;
              if (!deletedId) return prev;
              return prev.filter((g) => g.id !== deletedId);
            }

            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(giftsChannel);
    };
  }, [wishlist?.id]);

  // Contributions subscription (scoped to wishlist, filtered by current gift IDs)
  useEffect(() => {
    if (!wishlist?.id || giftIds.length === 0) return;

    const contributionsChannel = supabase
      .channel(`public-wishlist-contributions-${wishlist.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contributions",
        },
        (payload) => {
          // Extract gift_id from the change, guarding against missing data
          const giftId =
            (payload.new &&
              "gift_id" in payload.new &&
              (payload.new as Contribution).gift_id) ||
            (payload.old &&
              "gift_id" in payload.old &&
              (payload.old as Contribution).gift_id);

          // Ignore if not for a gift we currently display
          if (!giftId || !giftIds.includes(giftId)) return;

          setContributions((prev) => {
            const newTotals = { ...prev };

            if (payload.eventType === "INSERT") {
              const amount = (payload.new as Contribution).amount;
              newTotals[giftId] = (newTotals[giftId] || 0) + amount;
            } else if (payload.eventType === "UPDATE") {
              const oldAmount = (payload.old as Contribution).amount;
              const newAmount = (payload.new as Contribution).amount;
              const diff = newAmount - oldAmount;
              newTotals[giftId] = (newTotals[giftId] || 0) + diff;
            } else if (payload.eventType === "DELETE") {
              const oldAmount = (payload.old as Contribution).amount;
              newTotals[giftId] = (newTotals[giftId] || 0) - oldAmount;
            }

            return newTotals;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contributionsChannel);
    };
  }, [wishlist?.id, giftIds]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const reserveGift = async (giftId: string) => {
    setReservingId(giftId);

    const reservedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("gifts")
      .update({
        reserved: true,
        reserved_at: reservedAt,
      })
      .eq("id", giftId)
      .eq("reserved", false) // optimistic concurrency check
      .select();

    if (error) {
      alert(error.message);
      setReservingId(null);
      return;
    }

    // No rows updated → already reserved
    if (!data || data.length === 0) {
      alert("This gift was already reserved by someone else.");
      setReservingId(null);
      return;
    }

    // Update local state
    setGifts((prev) =>
      prev.map((g) =>
        g.id === giftId ? { ...g, reserved: true, reserved_at: reservedAt } : g,
      ),
    );

    setReservingId(null);
  };

  const contribute = async (giftId: string, price: number | null) => {
    const input = contributionInputs[giftId]?.trim() || "";
    const amount = parseFloat(input);

    // Validation
    if (!input) {
      setContributionErrors((prev) => ({
        ...prev,
        [giftId]: "Amount is required",
      }));
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setContributionErrors((prev) => ({
        ...prev,
        [giftId]: "Please enter a positive number",
      }));
      return;
    }
    if (price === null) {
      setContributionErrors((prev) => ({
        ...prev,
        [giftId]: "Cannot contribute to gift without price",
      }));
      return;
    }

    const totalContributed = contributions[giftId] || 0;
    const remaining = price - totalContributed;

    if (amount > remaining) {
      setContributionErrors((prev) => ({
        ...prev,
        [giftId]: `Amount cannot exceed ${usd.format(remaining)} remaining`,
      }));
      return;
    }

    setContributingId(giftId);
    setContributionErrors((prev) => ({ ...prev, [giftId]: "" }));

    const { error } = await supabase.from("contributions").insert({
      gift_id: giftId,
      amount,
    });

    if (error) {
      console.error("Contribution insert error:", error.message);
      setContributionErrors((prev) => ({
        ...prev,
        [giftId]: "Failed to add contribution. Try again.",
      }));
      setContributingId(null);
      return;
    }

    // Clear input on success
    setContributionInputs((prev) => ({ ...prev, [giftId]: "" }));
    setContributingId(null);

    // Realtime will update contributions
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fail silently – copy is not critical
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500">
          Loading wishlist...
        </div>
      </main>
    );
  }

  if (notFound || !wishlist) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Wishlist not found
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            This public link does not exist or is no longer available.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {wishlist.title}
              </h1>
              {wishlist.description && (
                <p className="mt-2 text-sm text-gray-600">
                  {wishlist.description}
                </p>
              )}
            </div>
            <button
              onClick={handleCopyLink}
              className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              {copySuccess ? "Copied!" : "Copy link"}
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Shared wishlist page. Friends can view gifts, reserve them, or
            contribute toward expensive gifts.
          </p>
        </div>

        {/* Gift grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Gifts</h2>
          <span className="text-sm text-gray-500">{gifts.length} items</span>
        </div>

        {gifts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500">
            No gifts yet.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {gifts.map((gift) => {
              const price = gift.price;
              const totalContributed = contributions[gift.id] || 0;
              const remaining = price !== null ? price - totalContributed : 0;
              const percent =
                price !== null && price > 0
                  ? Math.min(100, (totalContributed / price) * 100)
                  : 0;
              const isFullyFunded = price !== null && totalContributed >= price;

              return (
                <div
                  key={gift.id}
                  className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                >
                  {/* Image */}
                  <div className="relative h-52 w-full bg-gray-100">
                    {gift.image ? (
                      <Image
                        src={gift.image}
                        alt={gift.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="min-h-14 text-lg font-semibold text-gray-900">
                      {gift.title}
                    </h3>

                    <div className="mt-2 text-sm text-gray-600">
                      {price !== null
                        ? usd.format(price)
                        : "Price not specified"}
                    </div>

                    {/* Contribution section */}
                    {price !== null ? (
                      <div className="mt-4 space-y-3">
                        {/* Progress bar */}
                        <div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full bg-green-500 transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="mt-1 flex justify-between text-xs text-gray-600">
                            <span>
                              {usd.format(totalContributed)} collected
                            </span>
                            <span>{usd.format(remaining)} remaining</span>
                          </div>
                        </div>

                        {/* Contribution input & button */}
                        {!isFullyFunded && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={contributionInputs[gift.id] || ""}
                                onChange={(e) =>
                                  setContributionInputs((prev) => ({
                                    ...prev,
                                    [gift.id]: e.target.value,
                                  }))
                                }
                                placeholder="Amount"
                                className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none disabled:bg-gray-100"
                                disabled={contributingId === gift.id}
                              />
                              <button
                                type="button"
                                onClick={() => contribute(gift.id, price)}
                                disabled={
                                  contributingId === gift.id || isFullyFunded
                                }
                                className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                              >
                                {contributingId === gift.id
                                  ? "Adding..."
                                  : "Contribute"}
                              </button>
                            </div>
                            {contributionErrors[gift.id] && (
                              <p className="text-xs text-red-500">
                                {contributionErrors[gift.id]}
                              </p>
                            )}
                          </div>
                        )}

                        {isFullyFunded && (
                          <p className="text-sm font-medium text-green-600">
                            Fully funded! 🎉
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-gray-400 italic">
                        Contribution unavailable without target price
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                      {gift.url ? (
                        <a
                          href={gift.url}
                          target="_blank"
                          rel="noopener noreferrer"
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
                        disabled={!!gift.reserved || reservingId === gift.id}
                        className="rounded-2xl bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {gift.reserved
                          ? "Reserved"
                          : reservingId === gift.id
                            ? "Reserving..."
                            : "Reserve"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
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
