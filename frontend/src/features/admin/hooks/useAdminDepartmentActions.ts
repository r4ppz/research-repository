import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDepartment, deleteDepartment, updateDepartment } from "@/api/admin/departments";

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createDepartment({ departmentName: name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminDepartments"] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateDepartment(id, { departmentName: name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminDepartments"] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminDepartments"] });
    },
  });
}
