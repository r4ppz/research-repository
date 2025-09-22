import { useState, type FormEvent } from "react";
import style from "./LoginForm.module.css";
import Button from "../../../components/common/Button/Button";
import Input from "../../../components/common/Input/Input";

function LoginForm() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form className={style.form} onSubmit={onSubmit}>
      <div className={style.inputWrapper}>
        <label className={style.label} htmlFor="username">
          Username
        </label>
        <Input
          placeholder="Username"
          value={username}
          id="username"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
      </div>
      <div className={style.inputWrapper}>
        <label className={style.label} htmlFor="password">
          Password
        </label>
        <Input
          placeholder="Password"
          value={password}
          id="password"
          type="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </div>
      <Button className={style.loginButton} type="submit">
        Login
      </Button>
    </form>
  );
}

export default LoginForm;
