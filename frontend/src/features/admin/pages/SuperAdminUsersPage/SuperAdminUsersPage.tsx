import { UsersTable } from "../../components/UsersTable/UsersTable";
import style from "./SuperAdminUsersPage.module.css";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { useAuth } from "@/features/auth/context/useAuth";

export const SuperAdminUsersPage = () => {
  const { user } = useAuth();

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
          </section>

          <UsersTable currentUserId={user?.userId} />
        </div>
      </main>
      <Footer />
    </div>
  );
};
