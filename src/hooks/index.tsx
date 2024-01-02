import React from "react";
import { useInfiniteQuery } from "react-query";

import { useVirtualizer } from "@tanstack/react-virtual";

type Row = {
  id: number;
  title: string;
  date: number;
};

const hour = 1000 * 60 * 60;

async function fetchServerPage(
  limit: number,
  offset: number = 1,
  direction: "up" | "down" = "down"
): Promise<{ rows: Row[]; nextOffset: number }> {
  const rows = new Array(limit).fill(0).map((e, i) => {
    const step = i + offset;
    const date = new Date().getTime() - (direction === "up" ? -step : step);
    return {
      id: i + offset,
      title: `Async Row: ${step}`,
      date: date,
    };
  });

  await new Promise((r) => setTimeout(r, 500));

  return { rows, nextOffset: offset + 1 };
}

export const useInfiniteBidirectionalScroll = () => {
  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    "projects",
    (ctx) => {
      return fetchServerPage(30, ctx.pageParam);
    },
    {
      getNextPageParam: (_lastGroup, groups) => {
        return groups.length;
      },
    }
  );

  const {
    status: statusTop,
    data: dataTop,
    error: errorTop,
    isFetching: isFetchingTop,
    isFetchingNextPage: isFetchingNextPageTop,
    fetchNextPage: fetchNextPageTop,
    hasNextPage: hasNextPageTop,
  } = useInfiniteQuery(
    "projects",
    (ctx) => {
      return fetchServerPage(10, ctx.pageParam, "up");
    },
    {
      getNextPageParam: (_lastGroup, groups) => {
        return groups.length;
      },
    }
  );

  const allRows =
    data && dataTop
      ? [
          ...dataTop.pages.flatMap((d) => d.rows),
          ...data.pages.flatMap((d) => d.rows),
        ]
      : [];

  const parentRef = React.useRef();

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 2,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  React.useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    virtualItems,
  ]);

  React.useEffect(() => {
    const [firstItem] = [...virtualItems];

    console.log(firstItem);

    if (!firstItem) {
      return;
    }

    if (firstItem.index <= 0 && hasNextPageTop && !isFetchingNextPageTop) {
      fetchNextPageTop();
    }
  }, [
    hasNextPageTop,
    fetchNextPageTop,
    allRows.length,
    isFetchingNextPageTop,
    virtualItems,
  ]);

  return {
    parentRef,
    rowVirtualizer,
    allRows,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    error: error || errorTop,
    status: status || statusTop,
  };
};
