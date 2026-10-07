"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ShieldCheck, AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import { getMyAssignedStock } from "@/lib/stock.api";
import type { EventStock } from "@/types/stock";

export default function StaffStockWidget() {
  const [stocks, setStocks] = useState<EventStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getMyAssignedStock()
      .then((res) => {
        if (mounted && res.success) {
          setStocks(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#e8e1d8] bg-white p-5 shadow-sm animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
        <div className="h-8 w-full bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  // Active items currently taken / at event
  const inPossession = stocks.filter((s) => s.status === "TAKEN_BY_STAFF" || s.status === "AT_EVENT");
  const totalItemsInPossession = inPossession.reduce((sum, s) => sum + (s.takenQuantity || 0), 0);

  // Return pending or discrepancy
  const returnPendingOrDiscrepancy = stocks.filter((s) => s.status === "RETURN_PENDING" || s.status === "DISCREPANCY");
  const toCollect = stocks.filter((s) => s.status === "PLANNED" || s.status === "RESERVED" || s.status === "READY_FOR_COLLECTION");

  // Distinct events count
  const distinctEventIds = new Set(stocks.map((s) => (typeof s.eventId === "object" ? s.eventId._id : s.eventId)));

  if (stocks.length === 0) {
    return null; // Don't clutter staff dashboard if they don't have stock assigned
  }

  return (
    <div className="rounded-3xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7f3ee] text-[#9a6c37]">
            <Package size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#252525]">My Stock &amp; Equipment</h3>
            <p className="text-[11px] text-gray-400">Assigned event equipment tracking</p>
          </div>
        </div>

        <Link
          href="/staff/stock"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#9a6c37] hover:underline"
        >
          View All <ArrowRight size={13} />
        </Link>
      </div>

      {/* Urgent Action Banner if stock in possession or discrepancy */}
      {returnPendingOrDiscrepancy.some((s) => s.status === "DISCREPANCY") ? (
        <div className="mt-3 rounded-2xl bg-red-50 p-3 text-xs border border-red-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-red-800 flex items-center gap-1.5">
              <AlertCircle size={14} /> Discrepancy Needs Action
            </span>
            <Link
              href="/staff/stock"
              className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs"
            >
              Resolve
            </Link>
          </div>
        </div>
      ) : inPossession.length > 0 ? (
        <div className="mt-3 rounded-2xl bg-indigo-50/70 p-3 text-xs border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-indigo-950 block">Stock In Possession</span>
              <span className="text-[11px] text-indigo-700">
                {totalItemsInPossession} items held for {inPossession.length} event requirement(s)
              </span>
              {inPossession.find((s) => s.expectedReturnAt) && (
                <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                  Next scheduled return:{" "}
                  {new Date(
                    inPossession.find((s) => s.expectedReturnAt)!.expectedReturnAt!
                  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <Link
              href="/staff/stock"
              className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700 transition"
            >
              Return Stock
            </Link>
          </div>
        </div>
      ) : toCollect.length > 0 ? (
        <div className="mt-3 rounded-2xl bg-amber-50/70 p-3 text-xs border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-950 block">Stock Ready to Collect</span>
              <span className="text-[11px] text-amber-700">{toCollect.length} requirement(s) awaiting pickup</span>
            </div>
            <Link
              href="/staff/stock"
              className="rounded-xl bg-[#9a6c37] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#855c2d] transition"
            >
              Take Stock
            </Link>
          </div>
        </div>
      ) : null}

      {/* Summary Metrics */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-gray-50 p-2 border border-gray-100">
          <div className="text-[10px] uppercase font-bold text-gray-400">Events</div>
          <div className="text-sm font-extrabold text-[#252525] mt-0.5">{distinctEventIds.size}</div>
        </div>
        <div className="rounded-xl bg-gray-50 p-2 border border-gray-100">
          <div className="text-[10px] uppercase font-bold text-gray-400">In Custody</div>
          <div className="text-sm font-extrabold text-indigo-600 mt-0.5">{totalItemsInPossession}</div>
        </div>
        <div className="rounded-xl bg-gray-50 p-2 border border-gray-100">
          <div className="text-[10px] uppercase font-bold text-gray-400">Pending Ret</div>
          <div className="text-sm font-extrabold text-purple-600 mt-0.5">{returnPendingOrDiscrepancy.length}</div>
        </div>
      </div>
    </div>
  );
}
