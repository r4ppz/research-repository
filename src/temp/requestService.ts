import { type DocumentRequest, type ResearchPaper, type User } from "@/types";
import {
  addRequest as addRequestToStorage,
  getAllRequests as getAllRequestsFromStorage,
  getRequestById as getRequestByIdFromStorage,
  subscribeToRequests as subscribeToRequestsInStorage,
  updateRequest as updateRequestInStorage,
} from "./tempRequestStorage";

/**
 * Creates a new document request
 * @param paper - The research paper being requested
 * @param requester - The user making the request
 * @returns The newly created DocumentRequest object
 */
export const createDocumentRequest = (paper: ResearchPaper, requester: User): DocumentRequest => {
  const newRequest: DocumentRequest = {
    requestId: generateRequestId(),
    status: "PENDING",
    requestDate: new Date().toISOString(),
    paper: paper,
    requester: requester,
  };
  addRequestToStorage(newRequest);
  return newRequest;
};

/**
 * Retrieves all document requests for a specific user
 * @param userId - The ID of the user whose requests to retrieve
 * @returns Array of DocumentRequest objects for the user
 */
export const getUserRequests = (userId: number): DocumentRequest[] => {
  const allRequests = getAllRequestsFromStorage();
  return allRequests.filter((request) => request.requester.userId === userId);
};

/**
 * Retrieves a specific document request by ID
 * @param requestId - The ID of the request to retrieve
 * @returns The DocumentRequest object if found, undefined otherwise
 */
export const getRequestById = (requestId: number): DocumentRequest | undefined => {
  return getRequestByIdFromStorage(requestId);
};

/**
 * Updates a document request
 * @param requestId - The ID of the request to update
 * @param updatedRequest - Partial request object with updated fields
 */
export const updateRequest = (
  requestId: number,
  updatedRequest: Partial<DocumentRequest>,
): void => {
  updateRequestInStorage(requestId, updatedRequest);
};

/**
 * Subscribes to changes in the requests
 * @param listener - Function to call when requests change
 * @returns Unsubscribe function
 */
export const subscribeToRequests = (listener: () => void): (() => void) => {
  return subscribeToRequestsInStorage(listener);
};

/**
 * Generates a unique request ID
 * @returns A number that is likely unique as a request ID
 */
const generateRequestId = (): number => {
  const allRequests = getAllRequestsFromStorage();
  // Find the highest ID and add 1, or default to 1 if no requests exist
  const maxId = allRequests.length > 0 ? Math.max(...allRequests.map((r) => r.requestId)) : 0;
  return maxId + 1;
};
