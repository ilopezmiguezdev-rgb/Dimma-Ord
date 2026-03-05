import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sub, formatISO } from 'date-fns';

const useServiceOrderFilters = (orders) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'Todos');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('type') || 'Todas');
  const [dateFilter, setDateFilter] = useState(searchParams.get('period') || 'all');
  const [equipmentSerialFilter, setEquipmentSerialFilter] = useState(searchParams.get('equipment_serial') || '');
  const [technicianFilter, setTechnicianFilter] = useState(searchParams.get('technician') || 'Todos');
  const [reportedIssueFilter, setReportedIssueFilterState] = useState(searchParams.get('reported_issue') || '');
  const [debouncedReportedIssueFilter, setDebouncedReportedIssueFilter] = useState(searchParams.get('reported_issue') || '');

  const debounceTimerRef = useRef({});

  const debouncedUpdateURLParams = useCallback((key, value, delay = 300) => {
    if (debounceTimerRef.current[key]) {
      clearTimeout(debounceTimerRef.current[key]);
    }
    debounceTimerRef.current[key] = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      if (value && value !== 'Todos' && value !== 'all' && value !== 'Todas') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }, delay);
  }, [location.search, location.pathname, navigate]);

  useEffect(() => {
    const timers = debounceTimerRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('search') || '');
    setDebouncedSearchTerm(params.get('search') || '');
    setStatusFilter(params.get('status') || 'Todos');
    setPriorityFilter(params.get('type') || 'Todas');
    setDateFilter(params.get('period') || 'all');
    setEquipmentSerialFilter(params.get('equipment_serial') || '');
    setTechnicianFilter(params.get('technician') || 'Todos');
    setReportedIssueFilterState(params.get('reported_issue') || '');
    setDebouncedReportedIssueFilter(params.get('reported_issue') || '');
  }, [location.search]);

  const updateURLParams = (key, value, reset = false) => {
    const params = new URLSearchParams(location.search);
    if (reset) {
        // Clear all filters except the new one
        Array.from(params.keys()).forEach(key => params.delete(key));
    }
    if (value && value !== 'Todos' && value !== 'all' && value !== 'Todas') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };
  
  useEffect(() => {
    if (equipmentSerialFilter) {
      const params = new URLSearchParams();
      params.set('equipment_serial', equipmentSerialFilter);
      navigate(`/?${params.toString()}`, { replace: true });
    }
  }, [equipmentSerialFilter, navigate]);

  const handleSetEquipmentSerialFilter = (serial) => {
    setEquipmentSerialFilter(serial);
    updateURLParams('equipment_serial', serial, true);
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = [...orders];

    if (equipmentSerialFilter) {
      return filtered.filter(order => order.equipment_serial === equipmentSerialFilter);
    }

    if (debouncedSearchTerm) {
      const lowercasedTerm = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        (order.client_name && order.client_name.toLowerCase().includes(lowercasedTerm)) ||
        (order.equipment_model && order.equipment_model.toLowerCase().includes(lowercasedTerm)) ||
        (order.equipment_serial && order.equipment_serial.toLowerCase().includes(lowercasedTerm)) ||
        (order.reported_issue && order.reported_issue.toLowerCase().includes(lowercasedTerm)) ||
        (order.assigned_technician && order.assigned_technician.toLowerCase().includes(lowercasedTerm))
      );
    }

    if (statusFilter && statusFilter !== 'Todos') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (priorityFilter && priorityFilter !== 'Todas') {
      filtered = filtered.filter(order => order.order_type === priorityFilter);
    }

    if (technicianFilter && technicianFilter !== 'Todos') {
      filtered = filtered.filter(order => order.assigned_technician === technicianFilter);
    }

    if (debouncedReportedIssueFilter) {
      const lower = debouncedReportedIssueFilter.toLowerCase();
      filtered = filtered.filter(
        order => order.reported_issue && order.reported_issue.toLowerCase().includes(lower)
      );
    }

    if (dateFilter && dateFilter !== 'all') {
      let startDate;
      const now = new Date();
      if (dateFilter === 'this_week') {
        startDate = sub(now, { weeks: 1 });
      } else if (dateFilter === 'this_month') {
        startDate = sub(now, { months: 1 });
      } else if (dateFilter === 'last_3_months') {
        startDate = sub(now, { months: 3 });
      }
      if (startDate) {
        const startDateISO = formatISO(startDate, { representation: 'date' });
        filtered = filtered.filter(order => order.creation_date >= startDateISO);
      }
    }
    
    return filtered.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date));
  }, [orders, debouncedSearchTerm, statusFilter, priorityFilter, dateFilter, equipmentSerialFilter, technicianFilter, debouncedReportedIssueFilter]);

  const handleSetSearchTerm = (value) => {
    setSearchTerm(value);
    if (debounceTimerRef.current['searchFilter']) {
      clearTimeout(debounceTimerRef.current['searchFilter']);
    }
    debounceTimerRef.current['searchFilter'] = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 300);
    debouncedUpdateURLParams('search', value);
  };

  const handleSetReportedIssueFilter = (value) => {
    setReportedIssueFilterState(value);
    if (debounceTimerRef.current['reportedIssueFilter']) {
      clearTimeout(debounceTimerRef.current['reportedIssueFilter']);
    }
    debounceTimerRef.current['reportedIssueFilter'] = setTimeout(() => {
      setDebouncedReportedIssueFilter(value);
    }, 300);
    debouncedUpdateURLParams('reported_issue', value);
  };

  return {
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    statusFilter,
    setStatusFilter: (value) => updateURLParams('status', value),
    priorityFilter,
    setPriorityFilter: (value) => updateURLParams('type', value),
    dateFilter,
    setDateFilter: (value) => updateURLParams('period', value),
    technicianFilter,
    setTechnicianFilter: (value) => updateURLParams('technician', value),
    equipmentSerialFilter,
    setEquipmentSerialFilter: handleSetEquipmentSerialFilter,
    reportedIssueFilter,
    setReportedIssueFilter: handleSetReportedIssueFilter,
    filteredOrders,
  };
};

export default useServiceOrderFilters;