"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import ClientDirectory from "@/components/manager/clients/ClientDirectory";
import ClientModal from "@/components/manager/clients/ClientModal";
import {
  createClient,
  getClients,
  updateClient,
  type Client,
  type CreateClientPayload,
  type GetClientsParams,
} from "@/lib/client.api";

const initialPagination = { page: 1, limit: 12, total: 0, totalPages: 0 };

export default function ManagerClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState<GetClientsParams>({ page: 1, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async (nextFilters: GetClientsParams = filters) => {
    try {
      setLoading(true);
      setError("");
      const result = await getClients(nextFilters);
      setClients(result.data || []);
      setPagination(result.pagination);
      setFilters(nextFilters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchClients({ page: 1, limit: 12 });
    }, 0);

    return () => window.clearTimeout(timer);
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (payload: CreateClientPayload) => {
    if (editingClient) await updateClient(editingClient._id, payload);
    else await createClient(payload);
    setIsModalOpen(false);
    setEditingClient(null);
    await fetchClients({ ...filters, page: 1 });
  };

  const openCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleFiltersChange = (nextFilters: GetClientsParams) => {
    setFilters(nextFilters);
    void fetchClients(nextFilters);
  };

  return (
    <main className="space-y-5">
      <PageHeader
        title="Clients"
        description="Keep every customer relationship organized in one place."
        action={<button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B5B95] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#57487e]"><Plus size={17} />Add client</button>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard icon={<Users size={18} />} label="Total clients" value={pagination.total} />
        <SummaryCard label="Active clients" value={clients.filter((client) => client.status === "Active").length} tone="green" />
        <SummaryCard label="On this page" value={clients.length} tone="gold" />
      </div>

      <ClientDirectory clients={clients} pagination={pagination} loading={loading} error={error} filters={filters} onFiltersChange={handleFiltersChange} onEdit={openEdit} onAdd={openCreate} onRefresh={() => void fetchClients(filters)} />

      <ClientModal key={`${isModalOpen}-${editingClient?._id || "new"}`} isOpen={isModalOpen} editingClient={editingClient} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
    </main>
  );
}

function SummaryCard({ label, value, icon, tone = "purple" }: { label: string; value: number; icon?: React.ReactNode; tone?: "purple" | "green" | "gold" }) {
  const styles = { purple: "bg-[#F1EDF8] text-[#6B5B95]", green: "bg-green-50 text-green-700", gold: "bg-[#F4EBDD] text-[#9A7B4F]" };
  return <div className="flex items-center gap-3 rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[tone]}`}>{icon || <span className="text-sm font-bold">#</span>}</div><div><p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p><p className="mt-0.5 text-xl font-bold text-gray-900">{value}</p></div></div>;
}
