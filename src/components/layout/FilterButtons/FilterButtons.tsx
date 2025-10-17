import { ListFilter } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/common/Button/Button";
import { MOCK_DEPARTMENTS } from "@/mocks/mockData";
import style from "./FilterButtons.module.css";

interface FilterButtonsProps {
  onDepartmentChange: (department: string | null) => void;
  onYearChange: (year: string | null) => void;
}

function FilterButtons({ onDepartmentChange, onYearChange }: FilterButtonsProps) {
  const [showDepartmentOptions, setShowDepartmentOptions] = useState(false);
  const [showYearOptions, setShowYearOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const years = ["2025", "2024", "2023"]; // NOTE: I might need API for this idk

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
          Department <ListFilter size={16} />
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
          Year <ListFilter size={16} />
        </Button>
        {showYearOptions && (
          <div className={style.options}>
            <button
              onClick={() => {
                onYearChange(null);
                setShowYearOptions(false);
              }}
            >
              All
            </button>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => {
                  onYearChange(year);
                  setShowYearOptions(false);
                }}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterButtons;
