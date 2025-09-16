import { useState, useEffect, useCallback, useRef } from 'react';

interface Employee {
  id: string;
  user_id: string;
  employee_no: string;
  User: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  } | null;
  OrgAssignment: Array<{
    id: string;
    employee_id: string;
    org_unit_id: string;
    job_position_id?: string;
    OrgUnit: {
      id: string;
      name: string;
      code: string;
    } | null;
    JobPosition: {
      id: string;
      title: string;
      code: string;
    } | null;
  }>;
}

interface UseEmployeeSearchResult {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  searchEmployees: (query: string) => void;
  clearSearch: () => void;
}

export const useEmployeeSearch = (): UseEmployeeSearchResult => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchEmployees = useCallback(async (query: string) => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for 1.5 seconds
    debounceRef.current = setTimeout(async () => {
      if (!query.trim()) {
        setEmployees([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/hr/employees/search?q=${encodeURIComponent(query)}&limit=20`);
        const result = await response.json();

        if (result.success) {
          setEmployees(result.data);
        } else {
          setError(result.error || 'Failed to search employees');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to search employees');
      } finally {
        setLoading(false);
      }
    }, 500); // 1.5 seconds delay
  }, []);

  const clearSearch = useCallback(() => {
    // Clear timeout when clearing search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setEmployees([]);
    setError(null);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return { employees, loading, error, searchEmployees, clearSearch };
};
