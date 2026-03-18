// Support tickets are not implemented in the new backend yet.
// This stub keeps imports working without crashing.
import { useState, useCallback } from 'react';

export const useSupportTickets = () => {
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetchTickets  = useCallback(async () => { setTickets([]); }, []);
  const createTicket  = useCallback(async () => ({ success: false, error: 'Support tickets coming soon' }), []);
  const updateTicket  = useCallback(async () => ({ success: false }), []);
  const deleteTicket  = useCallback(async () => ({ success: false }), []);

  return { tickets, loading, error, fetchTickets, createTicket, updateTicket, deleteTicket };
};
