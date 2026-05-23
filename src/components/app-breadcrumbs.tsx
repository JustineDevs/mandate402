import type { Route } from "next";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: Route;
}

interface AppBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function AppBreadcrumbs({ items, className = "" }: AppBreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 text-steel">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1.5"
            >
              {index > 0 ? (
                <span className="text-stone select-none" aria-hidden="true">
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="font-medium text-brand-control transition-colors hover:text-brand-control-mid"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? "font-bold text-charcoal"
                      : "font-medium text-slate"
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
