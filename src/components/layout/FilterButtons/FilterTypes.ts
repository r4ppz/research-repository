export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  type: string;
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  componentType?: "dropdown" | "checkbox" | "radio";
}
