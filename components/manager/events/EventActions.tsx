import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Trash2,
  XCircle,
} from "lucide-react";

interface EventActionsProps {
  eventId: number | string;
  status:
    | "Confirmed"
    | "Pending"
    | "Completed"
    | "Cancelled";
  onConfirm?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export default function EventActions({
  eventId,
  status,
  onConfirm,
  onComplete,
  onCancel,
  onDelete,
}: EventActionsProps) {
  const canConfirm = status === "Pending";
  const canComplete = status === "Confirmed";
  const canCancel =
    status === "Pending" || status === "Confirmed";

  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-[#29241f]">
          Event Actions
        </h2>

        <p className="mt-1 text-sm text-[#756d64]">
          Manage this event and update its status.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {/* Back */}
        <Link
          href="/dashboard/events"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#ded5cb] px-4 text-sm font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
        >
          <ArrowLeft size={17} />
          Back to Events
        </Link>

        {/* Edit */}
        <Link
          href={`/dashboard/events/${eventId}/edit`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#ded5cb] px-4 text-sm font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
        >
          <Edit3 size={17} />
          Edit Event
        </Link>

        {/* Confirm */}
        {canConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#b8894b] px-4 text-sm font-semibold text-white transition hover:bg-[#a7773f]"
          >
            <CheckCircle2 size={17} />
            Confirm Event
          </button>
        )}

        {/* Complete */}
        {canComplete && (
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#557555] px-4 text-sm font-semibold text-white transition hover:bg-[#486548]"
          >
            <CheckCircle2 size={17} />
            Mark Completed
          </button>
        )}

        {/* Cancel */}
        {canCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#c99b93] px-4 text-sm font-semibold text-[#9b6258] transition hover:bg-[#fbf3f1]"
          >
            <XCircle size={17} />
            Cancel Event
          </button>
        )}

        {/* Delete */}
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 size={17} />
          Delete Event
        </button>
      </div>
    </div>
  );
}