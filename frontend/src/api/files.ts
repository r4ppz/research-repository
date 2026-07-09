import { axiosClient } from "@/api/axiosClient";

export const downloadFile = async (
  paperId: number,
  view = false,
): Promise<{ blob: Blob; filename: string }> => {
  const response = await axiosClient.get(`/api/files/${String(paperId)}`, {
    params: { view },
    responseType: "blob",
  });

  const disposition = response.headers["content-disposition"] as string | undefined;
  const filename = disposition?.match(/filename="(.+)"/)?.[1] ?? `paper_${String(paperId)}`;

  return { blob: response.data as Blob, filename };
};
