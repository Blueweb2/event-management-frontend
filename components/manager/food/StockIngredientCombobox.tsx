"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  Search,
  CheckCircle2,
  Package,
  X,
  ChevronDown,
} from "lucide-react";
import type { StockItem } from "@/types/stock";

export interface StockIngredientComboboxProps {
  name: string;
  stockItemId: string;
  stockItems: StockItem[];
  usedStockIds: Set<string>;
  onChangeName: (name: string) => void;
  onSelectStockItem: (item: StockItem) => void;
  onUnlinkStockItem: () => void;
  disabled?: boolean;
}

/**
 * Fast spread search matcher for finding items with short keywords or partial spellings.
 * e.g. "bmt" -> Basmati, "chk" -> Chicken
 */
export function matchSpreadSearch(item: StockItem, query: string): boolean {
  if (!query.trim()) return true;
  const trimmed = query.trim();

  const target = `${item.name} ${item.category || ""} ${item.sku || ""} ${
    item.location || ""
  }`.toLowerCase();

  // 1. Direct contains check
  if (target.includes(trimmed.toLowerCase())) return true;

  // 2. Spread character matching: e.g. "bmr" -> b.*m.*r
  const chars = trimmed
    .split("")
    .filter((c) => c.trim().length > 0)
    .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (chars.length > 0) {
    try {
      const spreadRegex = new RegExp(chars.join(".*"), "i");
      if (spreadRegex.test(target)) return true;
    } catch {
      // Ignore invalid regex
    }
  }

  // 3. Multi-word lookahead: e.g. "rice bas" -> (?=.*rice)(?=.*bas)
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    try {
      const lookahead = tokens
        .map((t) => `(?=.*${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`)
        .join("");
      const lookaheadRegex = new RegExp(lookahead, "i");
      if (lookaheadRegex.test(target)) return true;
    } catch {
      // Ignore invalid regex
    }
  }

  return false;
}

/**
 * Highlights matching letters in search results.
 */
export function renderHighlightedText(text: string, query: string): ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return <span>{text}</span>;

  const lowerText = text.toLowerCase();
  const rawQuery = trimmed.toLowerCase();
  const noSpaceQuery = rawQuery.replace(/\s+/g, "");

  // Sequential character spread highlight
  if (noSpaceQuery.length > 0) {
    const matchedIndices = new Set<number>();
    let qIdx = 0;
    for (let i = 0; i < lowerText.length && qIdx < noSpaceQuery.length; i++) {
      if (lowerText[i] === noSpaceQuery[qIdx]) {
        matchedIndices.add(i);
        qIdx++;
      }
    }

    if (qIdx === noSpaceQuery.length) {
      const parts: ReactNode[] = [];
      let currentChunk = "";
      let isHighlight = false;

      for (let i = 0; i < text.length; i++) {
        const isMatched = matchedIndices.has(i);
        if (isMatched !== isHighlight) {
          if (currentChunk) {
            parts.push(
              isHighlight ? (
                <span
                  key={`hl-${i}`}
                  className="font-black text-[#6B5B95] underline decoration-amber-400 decoration-2"
                >
                  {currentChunk}
                </span>
              ) : (
                <span key={`txt-${i}`}>{currentChunk}</span>
              )
            );
          }
          currentChunk = text[i];
          isHighlight = isMatched;
        } else {
          currentChunk += text[i];
        }
      }
      if (currentChunk) {
        parts.push(
          isHighlight ? (
            <span
              key="hl-last"
              className="font-black text-[#6B5B95] underline decoration-amber-400 decoration-2"
            >
              {currentChunk}
            </span>
          ) : (
            <span key="txt-last">{currentChunk}</span>
          )
        );
      }
      return <>{parts}</>;
    }
  }

  // Word-based highlight fallback
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    const escapedWords = words.map((w) =>
      w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    try {
      const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");
      const parts = text.split(regex);
      return (
        <>
          {parts.map((part, i) =>
            regex.test(part) ? (
              <span
                key={i}
                className="font-black text-[#6B5B95] underline decoration-amber-400 decoration-2"
              >
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </>
      );
    } catch {
      // Fallback below
    }
  }

  return <span>{text}</span>;
}

export default function StockIngredientCombobox({
  name,
  stockItemId,
  stockItems,
  usedStockIds,
  onChangeName,
  onSelectStockItem,
  onUnlinkStockItem,
  disabled = false,
}: StockIngredientComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  // Filter stock items with spread search
  const filteredItems = useMemo(() => {
    if (!name.trim()) return stockItems;
    return stockItems.filter((item) => matchSpreadSearch(item, name));
  }, [stockItems, name]);

  // Keep highlighted index in bounds
  useEffect(() => {
    if (highlightedIndex >= filteredItems.length) {
      setHighlightedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems.length, highlightedIndex]);

  // Auto-scroll list to highlighted item
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const itemEl = listRef.current.children[
        highlightedIndex
      ] as HTMLElement | undefined;
      itemEl?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  // Find linked stock item if any
  const linkedItem = useMemo(() => {
    if (!stockItemId) return null;
    return stockItems.find((s) => s._id === stockItemId) || null;
  }, [stockItemId, stockItems]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : Math.max(0, filteredItems.length - 1)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems.length > 0 && highlightedIndex < filteredItems.length) {
        const item = filteredItems[highlightedIndex];
        const isAlreadyUsed =
          usedStockIds.has(item._id) && stockItemId !== item._id;
        if (!isAlreadyUsed) {
          onSelectStockItem(item);
          setIsOpen(false);
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onUnlinkStockItem();
    onChangeName("");
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${isOpen ? "z-30" : "z-10"}`}
    >
      {/* Label */}
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
          Item Name *
        </label>
        {linkedItem && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ✓ In Stock: {linkedItem.availableQuantity} {linkedItem.unit}
          </span>
        )}
      </div>

      {/* Input Field with Dropdown Search */}
      <div className="relative flex items-center">
        <Search
          size={14}
          className="absolute left-2.5 text-stone-400 pointer-events-none"
        />
        <input
          type="text"
          required
          disabled={disabled}
          placeholder="Search stock or type item name (e.g. Rice, Onion, Chicken)..."
          value={name}
          onChange={(e) => {
            onChangeName(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-xl border pl-8 pr-8 p-2 text-xs font-bold outline-none transition focus:ring-2 focus:ring-[#6B5B95]/20 ${
            stockItemId
              ? "border-emerald-300 bg-emerald-50/20 text-stone-900 focus:border-emerald-500"
              : "border-gray-200 bg-white text-stone-900 focus:border-[#6B5B95]"
          }`}
        />

        {/* Clear or Dropdown Chevron */}
        {name ? (
          <button
            type="button"
            onClick={handleClear}
            title="Clear"
            className="absolute right-2 text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-stone-100 transition cursor-pointer"
          >
            <X size={13} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            tabIndex={-1}
            title="Show items"
            className="absolute right-2 text-stone-400 hover:text-stone-700 p-1 rounded-md transition cursor-pointer"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* Search Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-72 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-50 border-b border-stone-100 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1.5">
              <Package size={13} className="text-[#6B5B95]" />
              <span>Available Stock Items ({filteredItems.length})</span>
            </span>
            <span className="text-[10px] text-stone-400 lowercase font-medium">
              click or press enter to select
            </span>
          </div>

          {/* Quick custom item option if user typed something */}
          {name.trim() && (
            <div className="p-1.5 border-b border-stone-100 bg-stone-50/60 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onUnlinkStockItem();
                  setIsOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs hover:bg-stone-200/50 transition flex items-center justify-between text-stone-700 cursor-pointer"
              >
                <div>
                  <p className="font-bold text-[11px] text-stone-800">
                    Use &quot;{name.trim()}&quot;
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Custom item (not in stock list)
                  </p>
                </div>
                <span className="text-[10px] font-bold text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded-full">
                  Custom
                </span>
              </button>
            </div>
          )}

          {/* Scrollable list of matching stock items */}
          <div ref={listRef} className="overflow-y-auto p-1.5 space-y-1 flex-1">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-stone-500">
                <Package size={22} className="mx-auto text-stone-300 mb-1" />
                <p className="text-xs font-bold text-stone-700">
                  No stock items match &quot;{name}&quot;
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  You can still use this as a custom item.
                </p>
              </div>
            ) : (
              filteredItems.map((s, itemIdx) => {
                const isAlreadyUsed =
                  usedStockIds.has(s._id) && stockItemId !== s._id;
                const isSelected = stockItemId === s._id;
                const isHighlighted = itemIdx === highlightedIndex;

                return (
                  <button
                    key={s._id}
                    type="button"
                    disabled={isAlreadyUsed}
                    onClick={() => {
                      if (!isAlreadyUsed) {
                        onSelectStockItem(s);
                        setIsOpen(false);
                      }
                    }}
                    onMouseEnter={() => setHighlightedIndex(itemIdx)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl transition flex items-center justify-between gap-2.5 cursor-pointer ${
                      isAlreadyUsed
                        ? "opacity-40 bg-stone-50 cursor-not-allowed"
                        : isSelected
                        ? "bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold"
                        : isHighlighted
                        ? "bg-[#6B5B95]/10 text-stone-900"
                        : "hover:bg-stone-50 text-stone-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-purple-50 text-[#6B5B95] border-purple-100"
                        }`}
                      >
                        <Package size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {renderHighlightedText(s.name, name)}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {s.category} {s.location ? `· ${s.location}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isAlreadyUsed ? (
                        <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                          Already Added
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              s.availableQuantity > 0
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                : "bg-stone-100 text-stone-600 border border-stone-200"
                            }`}
                          >
                            {s.availableQuantity} {s.unit} in stock
                          </span>
                          {isSelected && (
                            <p className="text-[9px] font-bold text-emerald-700">
                              ✓ Selected
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Subtle Stock Info Line if linked */}
      {linkedItem && (
        <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-700 font-medium">
        
        </div>
      )}
    </div>
  );
}
