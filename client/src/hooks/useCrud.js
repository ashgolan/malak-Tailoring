import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const getErrMsg = (e) => {
  const d = e.response?.data;
  if (!d) return "שגיאה";
  if (typeof d === "string") return d;
  if (typeof d === "object") return d.message || d.error || JSON.stringify(d);
  return "שגיאה";
};

export function useCrud(queryKey, apiService) {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => apiService.getAll().then((r) => r.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [queryKey] });

  const createMutation = useMutation({
    mutationFn: (body) => apiService.create(body),
    onSuccess: () => { toast.success("נוסף בהצלחה ✓"); invalidate(); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiService.update(id, data),
    onSuccess: () => { toast.success("עודכן בהצלחה ✓"); invalidate(); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  // ✅ PATCH — بدون validation (للـ toggleApprove، toggleColor، etc.)
  const patchMutation = useMutation({
    mutationFn: ({ id, data }) => apiService.patch(id, data),
    onSuccess: () => invalidate(),
    onError: (e) => toast.error(getErrMsg(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiService.remove(id),
    onSuccess: () => { toast.success("נמחק ✓"); invalidate(); },
    onError: (e) => toast.error(getErrMsg(e)),
  });

  return {
    data,
    isLoading,
    create:      (body)      => createMutation.mutate(body),
    update:      (id, data)  => updateMutation.mutate({ id, data }),
    patch:       (id, data)  => patchMutation.mutate({ id, data }),   // ✅ חדש
    remove:      (id)        => deleteMutation.mutate(id),
    toggleColor: (id, data)  => patchMutation.mutate({ id, data }),   // ✅ alias
  };
}
