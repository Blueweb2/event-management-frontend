"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Edit2, Loader2, Mail, MapPin, Phone, Plus, Search, UserRound, XCircle } from "lucide-react";
import {
  activateClient,
  deactivateClient,
  type Client,
  type ClientStatus,
  type GetClientsParams,
} from "@/lib/client.api";

interface ClientDirectoryProps {
  clients: Client[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  loading: boolean;
  error: string;
  filters: GetClientsParams;
  onFiltersChange: (filters: GetClientsParams) => void;
  onEdit: (client: Client) => void;
  onViewPayments?: (client: Client) => void;
  onAdd: () => void;
  onRefresh: () => void;
}

export default function ClientDirectory({ clients, pagination, loading, error, filters, onFiltersChange, onEdit, onViewPayments, onAdd, onRefresh }: ClientDirectoryProps) {
  const [search, setSearch] = useState(filters.search || "");
  const [status, setStatus] = useState<ClientStatus | "">(filters.status || "");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() !== (filters.search || "")) onFiltersChange({ ...filters, search: search.trim(), page: 1 });
    }, 350);
    return () => clearTimeout(timer);
  }, [search, filters, onFiltersChange]);

  const handleStatusChange = (value: ClientStatus | "") => {
    setStatus(value);
    onFiltersChange({ ...filters, status: value, page: 1 });
  };

  const handleToggleStatus = async (client: Client) => {
    try {
      setUpdatingId(client._id);
      if (client.status === "Active") await deactivateClient(client._id);
      else await activateClient(client._id);
      onRefresh();
    } catch {
      onRefresh();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, phone, or city" className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B5B95] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B5B95]" />
        </div>
        <div className="flex items-center gap-2">
          {(["", "Active", "Inactive"] as const).map((value) => (
            <button key={value || "all"} type="button" onClick={() => handleStatusChange(value)} className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${status === value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {value || "All clients"}
            </button>
          ))}
        </div>
      </div>

      {error && <div role="alert" className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600"><span>{error}</span><button type="button" onClick={onRefresh} className="font-semibold underline">Retry</button></div>}

      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-[#e8e1d8] bg-white"><Loader2 size={28} className="animate-spin text-[#6B5B95]" /><p className="mt-3 text-sm text-gray-500">Loading client directory...</p></div>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4EBDD] text-[#9A7B4F]"><UserRound size={24} /></div><h3 className="mt-4 text-sm font-semibold text-gray-900">No clients found</h3><p className="mt-1 text-xs text-gray-500">Add a client or adjust your search filters.</p><button type="button" onClick={onAdd} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#6B5B95] px-4 py-2 text-xs font-semibold text-white hover:bg-[#57487e]"><Plus size={15} />Add client</button></div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <article key={client._id} className="flex min-h-56 flex-col justify-between rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6B5B95] text-sm font-bold text-white">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold text-gray-900">{client.name}</h2>
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${client.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {client.status === "Active" ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        {client.status}
                      </span>
                    </div>
                  </div>
                  <button type="button" onClick={() => onEdit(client)} title="Edit client" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800">
                    <Edit2 size={15} />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  <a href={`tel:${client.phone}`} className="flex items-center gap-2 hover:text-[#6B5B95]">
                    <Phone size={14} className="text-gray-400" />{client.phone}
                  </a>
                  <a href={`mailto:${client.email}`} className="flex items-center gap-2 truncate hover:text-[#6B5B95]">
                    <Mail size={14} className="shrink-0 text-gray-400" /><span className="truncate">{client.email}</span>
                  </a>
                  {(client.city || client.state) && (
                    <p className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />{[client.city, client.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>

                {client.notes && (
                  <p className="mt-3 line-clamp-2 rounded-xl bg-[#fcfaf6] p-2.5 text-xs leading-5 text-gray-500">
                    {client.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 border-t border-gray-100 pt-3 flex items-center justify-between">
                <button
                  type="button"
                  disabled={updatingId === client._id}
                  onClick={() => void handleToggleStatus(client)}
                  className="text-xs font-semibold text-gray-500 hover:text-[#6B5B95] disabled:opacity-50"
                >
                  {updatingId === client._id ? "Updating..." : client.status === "Active" ? "Deactivate" : "Reactivate"}
                </button>

                <button
                  type="button"
                  onClick={() => onViewPayments && onViewPayments(client)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#b8894b]/30 bg-[#faf6f0] px-3 py-1.5 text-xs font-bold text-[#9a6c37] transition hover:bg-[#b8894b] hover:text-white"
                >
                  <CreditCard size={14} />
                  <span>Events & Payments</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && <div className="flex items-center justify-between rounded-2xl border border-[#e8e1d8] bg-white px-4 py-3 text-xs text-gray-500"><span>Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} clients)</span><div className="flex gap-2"><button type="button" disabled={loading || pagination.page <= 1} onClick={() => onFiltersChange({ ...filters, page: pagination.page - 1 })} className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-700 disabled:opacity-40">Previous</button><button type="button" disabled={loading || pagination.page >= pagination.totalPages} onClick={() => onFiltersChange({ ...filters, page: pagination.page + 1 })} className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-700 disabled:opacity-40">Next</button></div></div>}
    </section>
  );
}
