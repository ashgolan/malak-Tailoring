import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

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
    onError: (e) => toast.error(e.response?.data || "שגיאה"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiService.update(id, data),
    onSuccess: () => { toast.success("עודכן בהצלחה ✓"); invalidate(); },
    onError: (e) => toast.error(e.response?.data || "שגיאה"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiService.remove(id),
    onSuccess: () => { toast.success("נמחק ✓"); invalidate(); },
    onError: (e) => toast.error(e.response?.data || "שגיאה"),
  });

  return {
    data,
    isLoading,
    create: (body) => createMutation.mutate(body),
    update: (id, data) => updateMutation.mutate({ id, data }),
    remove: (id) => deleteMutation.mutate(id),
    toggleColor: (id, data) => updateMutation.mutate({ id, data }),
  };
}
