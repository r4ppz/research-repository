import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/common/Button/Button";
import { MOCK_DEPARTMENTS, MOCK_REQUEST_DATES, MOCK_YEARS } from "@/mocks/mockData";
import style from "./FilterButtons.module.css";

interface FilterButtonsProps {
  onDepartmentChange: (department: string | null) => void;
  onYearChange?: (year: string | null) => void;
  onDateChange?: (date: string | null) => void;
  filterType?: "year" | "date";
}

function FilterButtons({
  onDepartmentChange,
  onYearChange,
  onDateChange,
  filterType = "year",
}: FilterButtonsProps) {
  const [showDepartmentOptions, setShowDepartmentOptions] = useState(false);
  const [showYearOptions, setShowYearOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const years = MOCK_YEARS; // Using years from mock data

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDepartmentOptions(false);
        setShowYearOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDepartment = () => {
    setShowDepartmentOptions(!showDepartmentOptions);
    setShowYearOptions(false); // Close other
  };

  const toggleYear = () => {
    setShowYearOptions(!showYearOptions);
    setShowDepartmentOptions(false); // Close other
  };

  return (
    <div className={style.container} ref={containerRef}>
      <div className={style.filterGroup}>
        <Button className={style.filterButton} onClick={toggleDepartment}>
          Department <ChevronDown size={16} />
        </Button>

        {showDepartmentOptions && (
          <div className={style.options}>
            <button
              onClick={() => {
                onDepartmentChange(null);
                setShowDepartmentOptions(false);
              }}
            >
              All
            </button>
            {MOCK_DEPARTMENTS.map((dept) => (
              <button
                key={dept.departmentId}
                onClick={() => {
                  onDepartmentChange(dept.departmentName);
                  setShowDepartmentOptions(false);
                }}
              >
                {dept.departmentName}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={style.filterGroup}>
        <Button className={style.filterButton} onClick={toggleYear}>
          {filterType === "date" ? "Date" : "Year"} <ChevronDown size={16} />
        </Button>
        {showYearOptions && (
          <div className={style.options}>
            <button
              onClick={() => {
                if (filterType === "date" && onDateChange) {
                  onDateChange(null);
                } else if (onYearChange) {
                  onYearChange(null);
                }
                setShowYearOptions(false);
              }}
            >
              All
            </button>
            {(filterType === "date" ? MOCK_REQUEST_DATES : years).map((value) => (
              <button
                key={value}
                onClick={() => {
                  if (filterType === "date" && onDateChange) {
                    onDateChange(value);
                  } else if (onYearChange) {
                    onYearChange(value);
                  }
                  setShowYearOptions(false);
                }}
              >
                {value}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterButtons;
