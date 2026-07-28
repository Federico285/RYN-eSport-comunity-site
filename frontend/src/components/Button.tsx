import type {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from "react";

type CommonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

const variants = {
  primary: "bg-volt text-ink hover:bg-white focus-visible:ring-volt",
  secondary:
    "border border-line bg-white/5 text-white hover:border-volt hover:text-volt focus-visible:ring-volt",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
