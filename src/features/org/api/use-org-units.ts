import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, queryKeys } from '@/lib/fetcher';

export interface OrgUnit {
  id: number;
  parent_id: number | null;
  type: string | null;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
  description: string | null;
  status: string | null;
  effective_from: string | null;
  effective_to: string | null;
  parent?: OrgUnit;
  children?: OrgUnit[];
  employees?: any[];
}

export interface CreateUnitData {
  name: string;
  code: string;
  type: string;
  description: string;
  parent_id: number | null;
  status: string;
  effective_from: string;
  effective_to: string;
}

// Lấy ds đơn vị
export function useOrgUnits() {
  return useQuery({
    queryKey: queryKeys.org.units(),
    queryFn: () => fetcher<OrgUnit[]>('/org/units'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// lấy đơn vị theo id
export function useOrgUnit(id: number) {
  return useQuery({
    queryKey: queryKeys.org.unit(id.toString()),
    queryFn: () => fetcher<OrgUnit>(`/org/units/${id}`),
    enabled: !!id,
  });
}

// tạo đơn vị
export function useCreateOrgUnit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUnitData) => 
      fetcher<OrgUnit>('/org/units', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate and refetch org units
      queryClient.invalidateQueries({ queryKey: queryKeys.org.units() });
    },
  });
}

// Update đơn vị
export function useUpdateOrgUnit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateUnitData }) => 
      fetcher<OrgUnit>(`/org/units/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // xóa cache và lấy lại ds đơn vị
      queryClient.invalidateQueries({ queryKey: queryKeys.org.units() });
    },
  });
}

// xóa đơn vị
export function useDeleteOrgUnit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      fetcher<void>(`/org/units/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      // xóa cache và lấy lại ds đơn vị
      queryClient.invalidateQueries({ queryKey: queryKeys.org.units() });
    },
  });
}
