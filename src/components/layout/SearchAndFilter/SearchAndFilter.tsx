import clsx from "clsx";
import { Search } from "lucide-react";
import Input from "@/components/common/Input/Input";
import DynamicFilter from "@/components/layout/FilterButtons/DynamicFilter";
import { FilterConfig } from "@/components/layout/FilterButtons/FilterTypes";
import style from "./SearchAndFilter.module.css";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters?: FilterConfig[];
  searchPlaceholder?: string;
  className?: string;
}

function SearchAndFilter({
  searchQuery,
  onSearchChange,
  filters = [],
  searchPlaceholder = "Search paper title",
  className,
}: SearchAndFilterProps) {
  return (
    <section className={clsx(style.searchSection, className)}>
      <Input
        type="search"
        icon={Search}
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={(e) => {
          onSearchChange(e.target.value);
        }}
      />

      <DynamicFilter filters={filters} />
    </section>
  );
}

export default SearchAndFilter;
