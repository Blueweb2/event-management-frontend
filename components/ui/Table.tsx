import type {
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
} from "react";

interface TableProps
  extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

interface TableContainerProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface TableHeaderProps
  extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

interface TableRowProps
  extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  clickable?: boolean;
}

interface TableHeadProps
  extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

interface TableBodyProps
  extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

interface TableCellProps
  extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function TableContainer({
  children,
  className = "",
  ...props
}: TableContainerProps) {
  return (
    <div
      className={`
        w-full
        overflow-x-auto
        rounded-2xl
        border
        border-[#E5E1D8]
        bg-white
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export default function Table({
  children,
  className = "",
  ...props
}: TableProps) {
  return (
    <table
      className={`
        w-full
        min-w-[720px]
        border-collapse
        text-left
        ${className}
      `}
      {...props}
    >
      {children}
    </table>
  );
}

export function TableHeader({
  children,
  className = "",
  ...props
}: TableHeaderProps) {
  return (
    <thead
      className={`
        bg-[#FCFBF8]
        ${className}
      `}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableHead({
  children,
  className = "",
  ...props
}: TableHeadProps) {
  return (
    <th
      className={`
        border-b
        border-[#EAE6DE]
        px-4
        py-3.5
        text-xs
        font-semibold
        uppercase
        tracking-[0.04em]
        text-[#77746D]
        first:pl-5
        last:pr-5
        sm:px-5
        ${className}
      `}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableBody({
  children,
  className = "",
  ...props
}: TableBodyProps) {
  return (
    <tbody
      className={`
        divide-y
        divide-[#EEEAE2]
        ${className}
      `}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  clickable = false,
  className = "",
  ...props
}: TableRowProps) {
  return (
    <tr
      className={`
        group
        bg-white
        transition-colors
        duration-150
        hover:bg-[#FCFBF8]
        ${clickable ? "cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className = "",
  ...props
}: TableCellProps) {
  return (
    <td
      className={`
        px-4
        py-4
        text-sm
        text-[#3F4044]
        first:pl-5
        last:pr-5
        sm:px-5
        ${className}
      `}
      {...props}
    >
      {children}
    </td>
  );
}