import React from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

type AnchorProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
    href: string;
  };

export function UiButton(props: ButtonProps | AnchorProps) {
  const {
    variant = "primary",
    size = "sm",
    loading,
    className,
    children,
    ...rest
  } = props as any;
  const base = "btn";
  const variantCls =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
      ? "btn-secondary"
      : "btn-ghost";
  const sizeCls = size === "sm" ? "btn-sm" : "";
  const loadingCls = loading ? "loading" : "";
  const cls = [base, variantCls, sizeCls, loadingCls, className]
    .filter(Boolean)
    .join(" ");

  if ("href" in props && props.href) {
    const { href, ...anchorRest } = rest as AnchorProps;
    return (
      <a href={href} className={cls} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...(rest as ButtonProps)}>
      {children}
    </button>
  );
}
