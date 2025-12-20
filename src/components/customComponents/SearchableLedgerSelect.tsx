import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLedgerStore } from "../../../store/ladgerStore";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LedgerValue {
  _id: string;
  ledgerName: string;
}

interface Props {
  value: LedgerValue | null;
  onValueChange: (ledger: LedgerValue | null) => void;
  companyId?: string;
  placeholder?: string;
}

export const SelectBasedLedger: React.FC<Props> = ({
  value,
  onValueChange,
  companyId,
  placeholder = "Select ledger",
}) => {
  const { ledgers, pagination, filterLedgers, loading } = useLedgerStore();

  const [allLedgers, setAllLedgers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ---------------------
  // 🔍 Debounced search
  // ---------------------
  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        setPage(1);
        setAllLedgers([]);
        filterLedgers(value, "all", "nameAsc", 1, 50, companyId);
      }, 400);
    },
    [companyId, filterLedgers]
  );

  // ---------------------
  // 📌 Initial load
  // ---------------------
  useEffect(() => {
    filterLedgers("", "all", "nameAsc", 1, 50, companyId);
  }, [companyId, filterLedgers]);

  // ---------------------
  // 📌 Merge fetched ledgers
  // ---------------------
  useEffect(() => {
    if (ledgers.length > 0) {
      setAllLedgers((prev) => {
        const ids = new Set(prev.map((l) => l._id));
        const newOnes = ledgers.filter((l) => !ids.has(l._id));
        return [...prev, ...newOnes];
      });
    }
  }, [ledgers]);

  // ---------------------
  // 📌 Pagination scroll
  // ---------------------
  const handleScroll = () => {
    if (!scrollRef.current || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 20) {
      if (pagination && page < pagination.totalPages) {
        const next = page + 1;
        setPage(next);
        filterLedgers(searchQuery, "all", "nameAsc", next, 50, companyId);
      }
    }
  };

  // ---------------------
  // 📌 Selected Ledger Object
  // ---------------------
  const selectedLedger = allLedgers.find((l) => l._id === value?._id) || value;

  return (
    <Select
      value={value?._id ?? ""}
      onValueChange={(id) => {
        const ledger = allLedgers.find((l) => l._id === id);
        if (ledger) {
          onValueChange({ _id: ledger._id, ledgerName: ledger.name });
        }
      }}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setSearchQuery("");
      }}
    >
      <SelectTrigger className="w-full h-11">
        <SelectValue placeholder={placeholder}>
          {selectedLedger ? (
            <div className="flex items-center justify-between w-full">
              <span>{selectedLedger.name}</span>
              {selectedLedger.ledgerCode && (
                <span className="text-xs text-gray-400 ml-4">
                  {selectedLedger.code}
                </span>
              )}
            </div>
          ) : null}
        </SelectValue>
      </SelectTrigger>

      <SelectContent className="max-w-[400px]">
        <div className="flex items-center border-b px-3 pb-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search ledgers..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-0 p-0 h-8 focus-visible:ring-0"
          />
        </div>

        <ScrollArea
          className="h-[240px]"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          <SelectGroup>
            {loading && allLedgers.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : allLedgers.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                No ledgers found
              </div>
            ) : (
              allLedgers.map((ledger) => (
                <SelectItem key={ledger._id} value={ledger._id}>
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{ledger.name}</span>
                    {ledger.code && (
                      <span className="text-xs text-gray-400 ml-4 flex-shrink-0">
                        {ledger.code}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            )}

            {loading && allLedgers.length > 0 && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </SelectGroup>
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};
