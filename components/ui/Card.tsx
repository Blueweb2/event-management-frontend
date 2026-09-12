import type {
  HTMLAttributes,
  ReactNode,
} from "react";

type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: CardPadding;
  hoverable?: boolean;
  title?: ReactNode;
  description?: ReactNode;
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

interface CardBodyProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  padding = "none",
  hoverable = false,
  title,
  description,
  className = "",
  ...props
}: CardProps) {
  const paddingStyles: Record<
    CardPadding,
    string
  > = {
    none: "",
    sm: "p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={`
        rounded-2xl
        border
        border-[#E5E1D8]
        bg-white
        shadow-[0_2px_10px_rgba(31,32,35,0.03)]
        ${paddingStyles[padding]}
        ${
          hoverable
            ? "transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D8D3C8] hover:shadow-[0_8px_25px_rgba(31,32,35,0.07)]"
            : ""
        }
        ${className}
      `}
      {...props}
    >
      {title && (
        <div className="border-b border-[#E5E1D8] px-5 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-[#1F2023]">{title}</h3>
          {description && (
            <p className="mt-1 text-xs text-[#77746D]">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className = "",
}: CardHeaderProps) {
  return (
    <div
      className={`
        flex
        items-start
        justify-between
        gap-4
        border-b
        border-[#EEEAE2]
        px-5
        py-4
        sm:px-6
        ${className}
      `}
    >
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-[#1F2023]">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm leading-5 text-[#77746D]">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
  ...props
}: CardBodyProps) {
  return (
    <div
      className={`p-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: CardFooterProps) {
  return (
    <div
      className={`
        border-t
        border-[#EEEAE2]
        bg-[#FCFBF8]
        px-5
        py-4
        sm:px-6
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}