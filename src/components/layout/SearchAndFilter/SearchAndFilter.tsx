import clsx from "clsx";
import { Search } from "lucide-react";
import Input from "@/components/common/Input/Input";
import FilterButtons from "@/components/layout/FilterButtons/FilterButtons";
import style from "./SearchAndFilter.module.css";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDepartmentChange: (department: string | null) => void;
  onYearChange: (year: string | null) => void;
  searchPlaceholder?: string;
  className?: string;
}

function SearchAndFilter({
  searchQuery,
  onSearchChange,
  onDepartmentChange,
  onYearChange,
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
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onSearchChange(e.target.value);
        }}
      />

      <FilterButtons onDepartmentChange={onDepartmentChange} onYearChange={onYearChange} />
    </section>
  );
}

export default SearchAndFilter;
