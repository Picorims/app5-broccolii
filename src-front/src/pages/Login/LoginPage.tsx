/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { FormEvent, useState } from "react";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import LabeledInput from "../../components/LabeledInput/LabeledInput";
import styles from "./LoginPage.module.css";
import { API } from "../../lib/api";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const [registerPasswordError, setRegisterPasswordError] = useState("");
  const [registerUsernameError, setRegisterUsernameError] = useState("");
  const navigate = useNavigate();

  const usernameRegex = /^[a-zA-Z0-9_]{3,32}$/g;

  const onSubmitLogin = async (e: FormEvent<HTMLFormElement>) => {
    console.log("Logging in...");
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const login = data.get("login");
    const password = data.get("password");

    const response = await API.login(login as string, password as string);
    if (response.ok) {
      const json = await response.json();
      localStorage.setItem("access_token", json.access_token);
      localStorage.setItem("refresh_token", json.refresh_token);
      console.log("Login successful");
      navigate("/clicker");
    } else {
      console.error("Login failed");
      alert("Login failed, please check your credentials or try again later");
    }
  };

  const onSubmitRegister = async (e: FormEvent<HTMLFormElement>) => {
    console.log("Registering...");
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const login = data.get("login");
    const password = data.get("password");
    const confirmPassword = data.get("confirm_password");

    setRegisterPasswordError("");
    setRegisterUsernameError("");

    if (!login || !password || !confirmPassword) {
      console.error("Missing fields");
      return;
    }

    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      setRegisterPasswordError("Passwords do not match");
      return;
    }

    if (!login.toString()?.match(usernameRegex)) {
      console.error("Invalid username");
      setRegisterUsernameError("Invalid username");
      return;
    }

    const response = await API.register(login.toString(), password.toString());
    if (response.ok) {
      const json = await response.json();
      localStorage.setItem("access_token", json.access_token);
      localStorage.setItem("refresh_token", json.refresh_token);
      console.log("Registration successful");
      navigate("/clicker");
    } else {
      console.error("Registration failed");
      alert("Registration failed, please try again later");
    }
  };

  return (
    <main className={styles.main}>
      <h1>Broccolii</h1>
      <Card>
        <h2>Login</h2>
        {/* TODO: adjust form */}
        <form action="" method="post" onSubmit={onSubmitLogin}>
          <LabeledInput type="text" label="Username" name="login" required />
          <LabeledInput
            type="password"
            label="Password"
            name="password"
            required
          />
          <Button type="submit" variant="primary">
            Login
          </Button>
        </form>
      </Card>
      <Card>
        <h2>Register</h2>
        {/* TODO: adjust form */}
        <form action="" method="post" onSubmit={onSubmitRegister}>
          <LabeledInput
            type="text"
            label="Username (between 3 and 32 alphanumeric characters separated by underscores)"
            name="login"
            error={registerUsernameError}
            pattern={usernameRegex}
            required
          />
          <LabeledInput
            type="password"
            label="Password"
            name="password"
            required
          />
          <LabeledInput
            type="password"
            label="Confirm Password"
            name="confirm_password"
            error={registerPasswordError}
            required
          />
          <Button type="submit" variant="primary">
            Register
          </Button>
        </form>
      </Card>
    </main>
  );
}
