import { trpc } from "@/lib/trpc";

export type LiveQuoteMap = Record<
  string,
  {
    price: number;
    changePct: number | null;
    high52: number | null;
    low52: number | null;
    marketTime: number | null;
  }
>;

/**
 * Fetches live quotes from the server (Yahoo Finance via Data API, cached 5 min server-side).
 * Returns a symbol-keyed map plus the fetch timestamp. Components keep their static
 * values as fallback when a symbol is missing (e.g. SPCX) or the query fails.
 */
export function useLiveQuotes() {
  const { data, isLoading, isError } = trpc.market.quotes.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const quoteMap: LiveQuoteMap = {};
  if (data?.quotes) {
    for (const q of data.quotes) {
      quoteMap[q.symbol] = {
        price: q.price,
        changePct: q.changePct,
        high52: q.high52,
        low52: q.low52,
        marketTime: q.marketTime,
      };
    }
  }

  const isLive = !isError && Object.keys(quoteMap).length > 0;
  const fetchedAt = data?.fetchedAt ?? null;

  return { quoteMap, isLive, isLoading, fetchedAt };
}
