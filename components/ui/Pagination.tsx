import type { ReactNode } from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
  showTotal?: boolean;
  siblingCount?: number;
  disabled?: boolean;
  className?: string;
}

type PageItem = number | "ellipsis";

export default function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  showTotal = true,
  siblingCount = 1,
  disabled = false,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) {
    if (showTotal && total !== undefined) {
      return (
        <div
          className={`
            flex
            items-center
            justify-between
            border-t
            border-[#EEEAE2]
            px-5
            py-4
            text-sm
            text-[#77746D]
            sm:px-6
            ${className}
          `}
        >
          <span>
            {total} {total === 1 ? "result" : "results"}
          </span>
        </div>
      );
    }

    return null;
  }

  const getPageItems = (): PageItem[] => {
    const firstPage = 1;
    const lastPage = totalPages;

    const pages: PageItem[] = [];

    const startPage = Math.max(
      firstPage,
      page - siblingCount,
    );

    const endPage = Math.min(
      lastPage,
      page + siblingCount,
    );

    if (startPage > firstPage + 1) {
      pages.push(firstPage);
      pages.push("ellipsis");
    } else {
      for (
        let current = firstPage;
        current < startPage;
        current++
      ) {
        pages.push(current);
      }
    }

    for (
      let current = startPage;
      current <= endPage;
      current++
    ) {
      pages.push(current);
    }

    if (endPage < lastPage - 1) {
      pages.push("ellipsis");
      pages.push(lastPage);
    } else {
      for (
        let current = endPage + 1;
        current <= lastPage;
        current++
      ) {
        pages.push(current);
      }
    }

    return pages;
  };

  const pages = getPageItems();

  const handlePageChange = (nextPage: number) => {
    if (
      disabled ||
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) {
      return;
    }

    onPageChange(nextPage);
  };

  return (
    <div
      className={`
        flex
        flex-col
        gap-4
        border-t
        border-[#EEEAE2]
        px-5
        py-4
        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:px-6
        ${className}
      `}
    >
      {/* Total */}
      {showTotal && total !== undefined ? (
        <p className="text-sm text-[#77746D]">
          Showing page{" "}
          <span className="font-medium text-[#3F4044]">
            {page}
          </span>{" "}
          of{" "}
          <span className="font-medium text-[#3F4044]">
            {totalPages}
          </span>{" "}
          ·{" "}
          <span className="font-medium text-[#3F4044]">
            {total}
          </span>{" "}
          {total === 1 ? "result" : "results"}
        </p>
      ) : (
        <div />
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <PaginationButton
          aria-label="Previous page"
          disabled={disabled || page <= 1}
          onClick={() =>
            handlePageChange(page - 1)
          }
        >
          <ChevronLeft />
        </PaginationButton>

        {/* Pages */}
        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((item, index) => {
            if (item === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    text-sm
                    text-[#77746D]
                  "
                >
                  …
                </span>
              );
            }

            const isActive = item === page;

            return (
              <PaginationButton
                key={item}
                active={isActive}
                disabled={disabled}
                onClick={() =>
                  handlePageChange(item)
                }
                aria-current={
                  isActive ? "page" : undefined
                }
                aria-label={`Page ${item}`}
              >
                {item}
              </PaginationButton>
            );
          })}
        </div>

        {/* Mobile page indicator */}
        <span className="px-2 text-sm text-[#77746D] sm:hidden">
          {page} / {totalPages}
        </span>

        {/* Next */}
        <PaginationButton
          aria-label="Next page"
          disabled={
            disabled || page >= totalPages
          }
          onClick={() =>
            handlePageChange(page + 1)
          }
        >
          <ChevronRight />
        </PaginationButton>
      </div>
    </div>
  );
}

interface PaginationButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  "aria-label"?: string;
  "aria-current"?:
    | "page"
    | "step"
    | "location"
    | "date"
    | "time"
    | true;
}

function PaginationButton({
  children,
  onClick,
  disabled = false,
  active = false,
  ...props
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex
        h-9
        min-w-9
        items-center
        justify-center
        rounded-lg
        px-2
        text-sm
        font-medium
        transition-all
        duration-150

        ${
          active
            ? "bg-[#1F2023] text-white"
            : "text-[#5F5D57] hover:bg-[#F3F1EC] hover:text-[#1F2023]"
        }

        disabled:cursor-not-allowed
        disabled:opacity-40

        focus:outline-none
        focus:ring-2
        focus:ring-[#B49A6A]/30
      `}
      {...props}
    >
      {children}
    </button>
  );
}

function ChevronLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}