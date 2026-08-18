import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { type FallbackProps, ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import styles from "./ErrorBoundary.module.css";
import { Heading, Text } from "@/components/common/Content/Content";
import { Link } from "@/components/common/Link/Link";
import { extractApiError } from "@/util/errorHandler";

interface ErrorBoundaryProps {
  children: ReactNode;
}

function SimpleFallback({ error }: FallbackProps) {
  const errorTraceId = extractApiError(error).traceId;
  const repoUrl = "https://github.com/acd-research-repo/research-repository/issues";

  return (
    <div className={styles.page} role="alert">
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <AlertCircle className={styles.icon} />
        </div>

        <Heading className={styles.heading}>Something went wrong</Heading>

        <Text className={styles.description}>
          An unexpected error occurred. Please try refreshing the page. If the problem persists, you
          can{" "}
          <Link href={repoUrl} className={styles.link}>
            report this issue on GitHub
          </Link>
          .
        </Text>

        {errorTraceId && <code className={styles.traceId}>Trace ID: {errorTraceId}</code>}
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return <ReactErrorBoundary FallbackComponent={SimpleFallback}>{children}</ReactErrorBoundary>;
}
