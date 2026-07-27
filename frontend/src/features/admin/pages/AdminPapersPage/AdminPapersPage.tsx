import { Archive, CircleCheck, FilePlus2, Search } from "lucide-react";
import { useState } from "react";
import { PaperFormModal } from "../../components/PaperFormModal/PaperFormModal";
import { PapersTable } from "../../components/PapersTable/PapersTable";
import style from "./AdminPapersPage.module.css";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { useAuth } from "@/features/auth/context/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { isUserSuperAdmin } from "@/util/roleBasedAccess";

export const AdminPapersPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaperModalOpen, setPaperModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const openModal = () => {
    setPaperModalOpen(true);
  };

  const closeModal = () => {
    setPaperModalOpen(false);
  };

  const changeTab = (t: "active" | "archived") => {
    setTab(t);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const isArchived = tab === "archived";
  const showDepartment = isUserSuperAdmin(user);

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <div className={style.mainContainer}>
          <div className={style.headerSection}>
            <h1 className={style.titleHeader}>Manage Research Papers</h1>
            <Button onClick={openModal} className={style.createButton}>
              <FilePlus2 className={style.iconTab} />
              Add Paper
            </Button>
          </div>

          <div className={style.tabsContainer}>
            <Button
              variant={tab === "active" ? "primary" : "secondary"}
              className={style.tabButton}
              onClick={() => {
                changeTab("active");
              }}
            >
              <CircleCheck className={style.iconTab} />
              Active Papers
            </Button>

            <Button
              variant={isArchived ? "primary" : "secondary"}
              className={style.tabButton}
              onClick={() => {
                changeTab("archived");
              }}
            >
              <Archive className={style.iconTab} />
              Archived Papers
            </Button>
          </div>

          <div className={style.searchWrapper}>
            <Input
              icon={Search}
              type="search"
              placeholder="Search by title, author, or abstract..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className={style.tableSection}>
            <PapersTable
              archived={isArchived}
              showDepartment={showDepartment}
              search={debouncedSearch}
            />
          </div>
        </div>
      </main>

      <PaperFormModal isOpen={isPaperModalOpen} onClose={closeModal} />
      <Footer />
    </div>
  );
};
