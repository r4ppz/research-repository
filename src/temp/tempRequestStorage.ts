import { type DocumentRequest } from "@/types";

let tempRequests: DocumentRequest[] = [];

const listeners: Array<() => void> = [];

export const initializeTempRequests = (mockRequests: DocumentRequest[]) => {
  if (tempRequests.length === 0) {
    // Only initialize if there are no requests yet
    tempRequests = [...mockRequests];
  }
};

export const getAllRequests = (): DocumentRequest[] => {
  return tempRequests;
};

export const addRequest = (request: DocumentRequest): void => {
  tempRequests.push(request);
  console.log("Added request to temp storage:", request);
  console.log("Total requests in storage:", tempRequests.length);
  listeners.forEach((listener) => {
    listener();
  });
};

export const getRequestById = (id: number): DocumentRequest | undefined => {
  return tempRequests.find((request) => request.requestId === id);
};

export const updateRequest = (id: number, updatedRequest: Partial<DocumentRequest>): void => {
  const index = tempRequests.findIndex((request) => request.requestId === id);
  if (index !== -1) {
    tempRequests[index] = { ...tempRequests[index], ...updatedRequest };
    listeners.forEach((listener) => {
      listener();
    });
  }
};

export const subscribeToRequests = (listener: () => void): (() => void) => {
  listeners.push(listener);
  return (): void => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};
