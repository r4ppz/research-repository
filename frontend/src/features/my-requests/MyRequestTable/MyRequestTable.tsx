import type { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { useUserRequests } from "../hooks/useUserRequests";
import { columns, type TableMeta } from "./columns";
import { downloadFile } from "@/api/files";
import { deleteRequest } from "@/api/request";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { triggerBrowserDownload } from "@/util/download";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";

export function MyRequestTable() {
  const [removalError, setRemovalError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  const { data, pageIndex, pageSize, pageCount, setPageIndex, isLoading, error, refresh } =
    useUserRequests();

  const tableMeta: TableMeta = {
    onDownload: (paperId: number) => {
      setDownloadError(null);

      if (downloadingIds.has(paperId)) {
        return;
      }

      setDownloadingIds((prev) => new Set(prev).add(paperId));

      downloadFile(paperId)
        .then(({ blob, filename }) => {
          triggerBrowserDownload(blob, filename);
        })
        .catch((error: unknown) => {
          setDownloadError(getUserErrorMessage(extractApiError(error)));
        })
        .finally(() => {
          setDownloadingIds((prev) => {
            const next = new Set(prev);
            next.delete(paperId);
            return next;
          });
        });
    },
    onRemove: (requestId: number) => {
      setRemovalError(null);
      if (removingIds.has(requestId)) {
        return;
      }

      setRemovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(requestId);
        return newSet;
      });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (async () => {
        try {
          await deleteRequest(requestId);
          await refresh();
        } catch (error) {
          const errorMessage = extractApiError(error);
          setRemovalError(getUserErrorMessage(errorMessage));
        } finally {
          setRemovingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(requestId);
            return newSet;
          });
        }
      })();
    },
  };

  if (isLoading && data.length === 0) {
    return <LoadingSpinner message="Loading your requests..." />;
  }

  if (error || removalError || downloadError) {
    return <p>Failed to load: {error ?? removalError ?? downloadError}</p>;
  }

  return (
    <DataTable
      caption="My Research Requests"
      columns={columns}
      data={data}
      pageCount={pageCount}
      pagination={{ pageIndex, pageSize }}
      onPaginationChange={(updater) => {
        let nextState: PaginationState;

        if (typeof updater === "function") {
          nextState = updater({ pageIndex, pageSize });
        } else {
          nextState = updater;
        }

        setPageIndex(nextState.pageIndex);
      }}
      meta={{ ...tableMeta, removingIds, downloadingIds }}
    />
  );
}
