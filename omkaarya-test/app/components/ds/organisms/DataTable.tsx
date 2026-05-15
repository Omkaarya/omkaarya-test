"use client";
import React from "react";
import { Icon } from "@/app/components/ds/atoms/Icon";
import { Checkbox } from "@/app/components/ds/atoms/CheckboxRadio";
import { ArrowDownIcon, ArrowUpIcon } from "@/app/icons";
import { TextCell } from "@/app/components/ds/molecules/TableCells";

export interface ColumnDef<T> {
  key: keyof T | string;
  header: React.ReactNode;
  width?: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  cell?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  // Sorting
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  // Selection
  isSelectable?: boolean;
  selectedIds?: string[];
  onSelectChange?: (ids: string[]) => void;
  /** Classes on the horizontal scrollport (`w-full min-w-0 overflow-x-auto`). Use for borders, etc. */
  className?: string;
  /** Classes merged onto `<table>` (e.g. `min-w-[960px]`). Min-width here avoids breaking the scrollport. */
  tableClassName?: string;
  isLoading?: boolean;
  loadingRows?: number;
}

// ─── Component Main ───────────────────────────────────────────────

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  isSelectable,
  selectedIds = [],
  onSelectChange,
  className = "",
  tableClassName = "",
  isLoading = false,
  loadingRows = 5,
}: DataTableProps<T>) {

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectChange) return;
    if (checked) onSelectChange(data.map(keyExtractor));
    else onSelectChange([]);
  };

  const handleSelectOne = (checked: boolean, id: string) => {
    if (!onSelectChange) return;
    if (checked) onSelectChange([...selectedIds, id]);
    else onSelectChange(selectedIds.filter(v => v !== id));
  };

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className={`w-full min-w-0 overflow-x-auto ${className}`.trim()}>
      <table
        className={`w-full min-w-[600px] border-collapse text-left whitespace-nowrap ${tableClassName}`.trim()}
      >
        
        {/* Table Header */}
        <thead>
          <tr className="border-b border-border bg-subtle">
            {isSelectable && (
              <th className="w-12 px-6 py-3">
                <Checkbox 
                  checked={allSelected} 
                  indeterminate={someSelected} 
                  onChange={(e) => handleSelectAll(e.target.checked)} 
                />
              </th>
            )}
            
            {columns.map((col, idx) => (
              <th 
                key={String(col.key) || idx}
                style={{ width: col.width }}
                className={`
                  px-6 py-3 text-xs font-semibold text-text-tertiary tracking-wider
                  ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}
                  ${col.sortable ? "cursor-pointer hover:bg-border/30 transition-colors select-none group" : ""}
                `}
                onClick={() => col.sortable && onSort && onSort(String(col.key))}
              >
                <div className={`flex items-center gap-1 ${col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "justify-start"}`}>
                  {col.header}
                  {col.sortable && sortColumn === String(col.key) && (
                    <Icon 
                      icon={sortDirection === "asc" ? ArrowUpIcon : ArrowDownIcon} 
                      size="sm" 
                      className="text-text-primary" 
                    />
                  )}
                  {col.sortable && sortColumn !== String(col.key) && (
                    <Icon icon={ArrowDownIcon} size="sm" className="opacity-0 group-hover:opacity-50 transition-opacity" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-border bg-surface">
          {isLoading ? (
            Array.from({ length: loadingRows }).map((_, rIdx) => (
              <tr key={`loading-${rIdx}`} className="animate-pulse">
                {isSelectable && <td className="px-6 py-4"><div className="h-4 w-4 bg-border/40 rounded" /></td>}
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="px-6 py-4">
                    <div className="h-4 bg-border/40 rounded w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (isSelectable ? 1 : 0)} className="px-6 py-12 text-center text-sm text-text-tertiary">
                No results found
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const id = keyExtractor(row);
              const isSelected = selectedIds.includes(id);

              return (
                <tr 
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    transition-colors group
                    ${onRowClick ? "cursor-pointer hover:bg-subtle" : ""}
                    ${isSelected ? "bg-brand/5 hover:bg-brand/10" : "hover:bg-subtle/30"}
                  `}
                >
                  {isSelectable && (
                    <td className="w-12 px-6 py-4 relative" onClick={(e) => e.stopPropagation()}>
                       {/* Colored left indicator line for selected rows mapping Figma layout */}
                       {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand" />}
                       <Checkbox 
                         checked={isSelected} 
                         onChange={(e) => handleSelectOne(e.target.checked, id)} 
                       />
                    </td>
                  )}

                  {columns.map((col, cIdx) => (
                    <td 
                      key={cIdx} 
                      className={`
                        px-6 py-4 align-middle 
                        ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}
                      `}
                    >
                      {col.cell ? (
                        col.cell(row)
                      ) : (
                        <TextCell
                          text={String(
                            (row as Record<string, unknown>)[String(col.key)] ?? "",
                          )}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>

      </table>
    </div>
  );
}
