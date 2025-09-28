import Header from "../../../components/layouts/Header/Header";
import type { User } from "../../../types/User";
import style from "./HomePage.module.css";

function HomePage() {
  const user: User = {
    id: "123",
    name: "Testing",
    email: "testing123@gmail.com",
    role: "student",
  };

  return (
    <div className={style.page}>
      <Header user={user} />
      <div></div>
    </div>
  );
}

export default HomePage;
