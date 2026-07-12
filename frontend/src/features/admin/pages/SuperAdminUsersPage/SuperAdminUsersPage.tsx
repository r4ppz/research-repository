import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AddUserModal } from "../../components/AddUserModal/AddUserModal";
import { UsersTable } from "../../components/UsersTable/UsersTable";
import style from "./SuperAdminUsersPage.module.css";
import { Button } from "@/components/common/Button/Button";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { useAuth } from "@/features/auth/context/useAuth";

export const SuperAdminUsersPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddUserOpen, setAddUserOpen] = useState(false);

  const openAddUser = () => {
    setAddUserOpen(true);
  };

  const closeAddUser = () => {
    setAddUserOpen(false);
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

          <UsersTable currentUserId={user?.userId} />
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
