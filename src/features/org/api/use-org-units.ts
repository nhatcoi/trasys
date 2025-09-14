import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, queryKeys } from '@/lib/fetcher';

export interface Employee {
  id: string;
  name?: string;
  code?: string;
  email?: string;
  phone?: string;
  position?: string;
  status?: string;
}

export interface OrgUnitRelation {
  parent_id: string;
  child_id: string;
  relation_type: 'direct' | 'advisory' | 'support' | 'collab';
  effective_from: string;
  effective_to: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgUnitWithRelation extends OrgUnitRelation {
  parent?: OrgUnit;
  child?: OrgUnit;
}

export interface OrgUnitHistory {
  id: string;
  org_unit_id: string;
  old_name: string | null;
  new_name: string | null;
  change_type: string;
  details: any | null;
  changed_at: string | null;
}

export interface OrgUnit {
  id: string; // Changed to string due to BigInt serialization
  parent_id: string | null; // Changed to string due to BigInt serialization
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
  employees?: Employee[];
  parentRelations?: OrgUnitWithRelation[];
  childRelations?: OrgUnitWithRelation[];
}

export interface OrgUnitsResponse {
  success: boolean;
  data: {
    items: OrgUnit[];
    pagination: {
      page: number;
      size: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      search?: string;
      status?: string;
      type?: string;
      fromDate?: string;
      toDate?: string;
    };
    sorting: {
      sort: string;
      order: string;
    };
  };
}

export interface CreateUnitData {
  name: string;
  code: string;
  type?: string;
  description?: string;
  parent_id?: number | null;
  status?: string;
  effective_from?: string;
  effective_to?: string;
}

// Lấy ds đơn vị với pagination và filtering
export function useOrgUnits(params?: {
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  status?: string;
  type?: string;
  fromDate?: string;
  toDate?: string;
  include_children?: boolean;
  include_employees?: boolean;
  include_parent?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.org.units(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.size) searchParams.set('size', params.size.toString());
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.order) searchParams.set('order', params.order);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.type) searchParams.set('type', params.type);
      if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
      if (params?.toDate) searchParams.set('toDate', params.toDate);
      if (params?.include_children) searchParams.set('include_children', 'true');
      if (params?.include_employees) searchParams.set('include_employees', 'true');
      if (params?.include_parent) searchParams.set('include_parent', 'true');
      
      const url = `/org/units${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      console.log('Fetching URL:', url);
      const response = await fetcher<OrgUnitsResponse>(url);
      console.log('API Response:', response);
      return response; // Return full response with pagination info
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
}

// lấy đơn vị theo id
export function useOrgUnit(id: string) {
  return useQuery({
    queryKey: queryKeys.org.unit(id),
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
    mutationFn: ({ id, ...data }: { id: string } & Partial<OrgUnit>) => 
      fetcher<OrgUnit>(`/org/units/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      // Invalidate specific unit cache
      queryClient.invalidateQueries({ queryKey: queryKeys.org.unit(id) });
      // Invalidate units list cache
      queryClient.invalidateQueries({ queryKey: queryKeys.org.units() });
    },
  });
}

// xóa đơn vị
export function useDeleteOrgUnit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      fetcher<void>(`/org/units/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      // xóa cache và lấy lại ds đơn vị
      queryClient.invalidateQueries({ queryKey: queryKeys.org.units() });
    },
  });
}

// Lấy lịch sử thay đổi
export interface HistoryResponse {
  success: boolean;
  data: {
    items: OrgUnitHistory[];
    pagination: {
      page: number;
      size: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export function useOrgUnitHistory(params?: {
  org_unit_id?: string;
  change_type?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: queryKeys.org.history(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params?.org_unit_id) searchParams.set('org_unit_id', params.org_unit_id);
      if (params?.change_type) searchParams.set('change_type', params.change_type);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.size) searchParams.set('size', params.size.toString());
      
      const url = `/org/history${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetcher<HistoryResponse>(url);
      return response;
    },
    enabled: !!params?.org_unit_id,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });
}

// Hook for fetching org unit relations
export function useOrgUnitRelations(unitId: string) {
  return useQuery({
    queryKey: ['org-unit-relations', unitId],
    queryFn: async () => {
      // Fetch relations where this unit is parent
      const parentResponse = await fetcher(`/org-unit-relations?parent_id=${unitId}`);
      // Fetch relations where this unit is child  
      const childResponse = await fetcher(`/org-unit-relations?child_id=${unitId}`);
      
      return {
        parentRelations: (parentResponse as any).items || [],
        childRelations: (childResponse as any).items || [],
      };
    },
    enabled: !!unitId,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });
}

// Hook for CRUD operations on org unit relations
export function useOrgUnitRelationMutations() {
  const queryClient = useQueryClient();

  const createRelation = useMutation({
    mutationFn: (data: {
      parent_id: string;
      child_id: string;
      relation_type: 'direct' | 'advisory' | 'support' | 'collab';
      effective_from: string;
      effective_to?: string | null;
      note?: string;
    }) => fetcher('/org-unit-relations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['org-unit-relations', variables.parent_id] });
      queryClient.invalidateQueries({ queryKey: ['org-unit-relations', variables.child_id] });
    },
  });

  const updateRelation = useMutation({
    mutationFn: ({ 
      key, 
      data 
    }: {
      key: {
        parent_id: string;
        child_id: string;
        relation_type: string;
        effective_from: string;
      };
      data: Partial<{
        relation_type: 'direct' | 'advisory' | 'support' | 'collab';
        effective_to: string | null;
        note: string;
      }>;
    }) => fetcher(`/org-unit-relations/by-key?${new URLSearchParams(key as any).toString()}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['org-unit-relations', variables.key.parent_id] });
      queryClient.invalidateQueries({ queryKey: ['org-unit-relations', variables.key.child_id] });
    },
  });

  const deleteRelation = useMutation({
    mutationFn: (key: {
      parent_id: string;
      child_id: string;
      relation_type: string;
      effective_from: string;
    }) => fetcher(`/org-unit-relations/by-key?${new URLSearchParams(key as any).toString()}`, {
      method: 'DELETE',
    }),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['org-unit-relations', variables.parent_id] });
      queryClient.invalidateQueries({ queryKey: ['org-unit-relations', variables.child_id] });
    },
  });

  return {
    createRelation,
    updateRelation,
    deleteRelation,
  };
}
