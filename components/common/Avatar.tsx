import type { ImgHTMLAttributes } from "react";

type AvatarSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

interface AvatarProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "alt"
  > {
  name?: string;
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  showStatus?: boolean;
  status?: "active" | "inactive";
  className?: string;
}

export default function Avatar({
  name = "User",
  src,
  alt,
  size = "md",
  showStatus = false,
  status = "active",
  className = "",
  ...props
}: AvatarProps) {
  const sizes: Record<
    AvatarSize,
    string
  > = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl",
  };

  const statusSizes: Record<
    AvatarSize,
    string
  > = {
    xs: "h-2 w-2",
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
    xl: "h-4 w-4",
  };

  const initials = getInitials(name);

  return (
    <div
      className={`
        relative
        inline-flex
        shrink-0
        ${className}
      `}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={`
            ${sizes[size]}
            rounded-full
            object-cover
            ring-1
            ring-[#E5E1D8]
          `}
          {...props}
        />
      ) : (
        <div
          className={`
            flex
            items-center
            justify-center
            rounded-full
            bg-[#EDE5D6]
            font-semibold
            text-[#80683D]
            ring-1
            ring-[#E5E1D8]
            ${sizes[size]}
          `}
          aria-label={alt || name}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={`
            absolute
            bottom-0
            right-0
            rounded-full
            border-2
            border-white
            ${
              status === "active"
                ? "bg-[#2E9B57]"
                : "bg-[#9B9891]"
            }
            ${statusSizes[size]}
          `}
          aria-label={
            status === "active"
              ? "Active"
              : "Inactive"
          }
        />
      )}
    </div>
  );
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`
    .toUpperCase();
}