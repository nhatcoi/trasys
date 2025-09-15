import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/fetcher';

export interface Campus {
  id: string;
  code: string;
  name_vi: string;
  name_en?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CampusesResponse {
  success: boolean;
  data: Campus[];
  total: number;
}

const queryKeys = {
  campuses: (params?: { status?: string; search?: string }) => 
    ['campuses', params] as const,
};

export function useCampuses(params?: {
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.campuses(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);
      
      const url = `/campuses${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetcher<CampusesResponse>(url);
      return response || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}
