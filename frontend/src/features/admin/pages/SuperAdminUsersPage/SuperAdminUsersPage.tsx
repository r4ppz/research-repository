import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { AddUserModal } from "../../components/AddUserModal/AddUserModal";
import { UsersTable } from "../../components/UsersTable/UsersTable";
import style from "./SuperAdminUsersPage.module.css";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/common/Input/Input";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { useAuth } from "@/features/auth/context/useAuth";
import { useDebounce } from "@/hooks/useDebounce";

export const SuperAdminUsersPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddUserOpen, setAddUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 500);

  const openAddUser = () => {
    setAddUserOpen(true);
  };

  const closeAddUser = () => {
    setAddUserOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <div className={style.mainContainer}>
          <section className={style.headerSection}>
            <div>
              <h1 className={style.titleHeader}>Manage Users</h1>
              <p className={style.subtitle}>Change roles from the database and revoke sessions.</p>
            </div>
            <Button onClick={openAddUser} className={style.addUserButton}>
              Add User
            </Button>
          </section>

          <div className={style.searchWrapper}>
            <Input
              icon={Search}
              type="search"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <UsersTable currentUserId={user?.userId} search={debouncedSearch} />
        </div>
      </main>

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={closeAddUser}
        onUserAdded={() => {
          void queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
        }}
      />
      <Footer />
    </div>
  );
};
