import { MOCK_PAPERS } from "./paperMocks";
import { MOCK_REQUESTS } from "./requestMocks";

// Extract unique years from MOCK_PAPERS submission dates
export const MOCK_YEARS = Array.from(
  new Set(MOCK_PAPERS.map((paper) => paper.submissionDate.substring(0, 4))),
)
  .sort()
  .reverse();

// Extract unique request dates from MOCK_REQUESTS
export const MOCK_REQUEST_DATES = Array.from(
  new Set(MOCK_REQUESTS.map((request) => request.requestDate.substring(0, 10))), // Extract date part (YYYY-MM-DD)
)
  .sort()
  .reverse();