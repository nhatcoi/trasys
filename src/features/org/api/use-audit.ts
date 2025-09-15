import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/fetcher';

export interface OrgUnit {
  id: string;
  name: string;
  code: string;
  type: string | null;
  status: string | null;
  description: string | null;
  campus_id: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  effective_from: string | null;
  effective_to: string | null;
  planned_establishment_date: string | null;
}

export interface OrgUnitHistory {
  id: string;
  org_unit_id: string;
  old_name: string | null;
  new_name: string | null;
  change_type: string;
  details: { [key: string]: unknown };
  changed_at: string;
  changed_by: string | null;
}

export interface AuditResponse {
  items: OrgUnit[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

export interface HistoryResponse {
  items: OrgUnitHistory[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export function useAuditUnits(params: {
  status?: string;
  type?: string;
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
} = {}) {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.size) queryParams.append('size', params.size.toString());
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.order) queryParams.append('order', params.order);

      const response = await fetcher(`/org/units/audit?${queryParams.toString()}`);
      
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch audit data');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch audit data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.status, params.type, params.page, params.size, params.sort, params.order]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}

export function useUnitHistory(unitId: string, params: {
  change_type?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
} = {}) {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!unitId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params.change_type) queryParams.append('change_type', params.change_type);
      if (params.from_date) queryParams.append('from_date', params.from_date);
      if (params.to_date) queryParams.append('to_date', params.to_date);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.size) queryParams.append('size', params.size.toString());
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.order) queryParams.append('order', params.order);

      const response = await fetcher(`/org/units/${unitId}/history?${queryParams.toString()}`);
      
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch unit history');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch unit history'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [unitId, params.change_type, params.from_date, params.to_date, params.page, params.size, params.sort, params.order]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}
