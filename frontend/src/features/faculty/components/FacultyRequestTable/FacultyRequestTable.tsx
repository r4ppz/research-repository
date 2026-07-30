import { Search } from "lucide-react";
import { useState } from "react";
import { columns, type TableMeta } from "./columns";
import { downloadFile } from "@/api/files";
import { getUserRequests } from "@/api/users";
import { deleteRequest } from "@/api/request";
import { DataTable } from "@/components/common/DataTable/DataTable";
import { Input } from "@/components/common/Input/Input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner/LoadingSpinner";
import { usePaginatedSearch } from "@/hooks/usePaginatedSearch";
import { triggerBrowserDownload } from "@/util/download";
import { extractApiError, getUserErrorMessage } from "@/util/errorHandler";
import styles from "./FacultyRequestTable.module.css";

export function FacultyRequestTable() {
  const [removalError, setRemovalError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  const { data, pageIndex, pageSize, pageCount, setPageIndex, setPageSize, isLoading, error, searchQuery, handleSearchChange, refresh } =
    usePaginatedSearch("facultyRequests", getUserRequests);

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
    <>
      <div className={styles.searchWrapper}>
        <Input
          icon={Search}
          type="search"
          placeholder="Search by title, author, or department..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      <DataTable
        caption="My Research Requests"
        columns={columns}
        data={data}
        pageCount={pageCount}
        pagination={{ pageIndex, pageSize }}
        onPaginationChange={(updater) => {
          const nextState =
            typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
          setPageIndex(nextState.pageIndex);
          setPageSize(nextState.pageSize);
        }}
        meta={{ ...tableMeta, removingIds, downloadingIds }}
        emptyMessage={searchQuery ? "No requests match your search." : undefined}
      />
    </>
  );
}
