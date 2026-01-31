export * from "@/lib/api";
export interface NavLink {
  label: string;
  href: string;
}
export interface SizeOption {
  size: string;
  available: boolean;
  stock: number;
}
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}
export interface SortOption {
  label: string;
  value: string;
}
export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export interface SelectOption {
  label: string;
  value: string;
}