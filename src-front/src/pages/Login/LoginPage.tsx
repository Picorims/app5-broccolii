/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { FormEvent, useEffect, useRef, useState } from "react";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import LabeledInput from "../../components/LabeledInput/LabeledInput";
import styles from "./LoginPage.module.css";
import { WebSocketConnection } from "../../lib/web_socket";

export default function LoginPage() {
  const [registerPasswordError, setRegisterPasswordError] = useState("");

  const testWs = useRef<WebSocketConnection | null>(null);

  const onSubmitLogin = (e: FormEvent<HTMLFormElement>) => {
    console.log("Logging in...");
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const login = data.get("login");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const password = data.get("password");

    if (testWs.current) {
      testWs.current.sendMessage("Hello from the client");
    }
  };

  const onSubmitRegister = (e: FormEvent<HTMLFormElement>) => {
    console.log("Registering...");
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const login = data.get("login");
    const password = data.get("password");
    const confirmPassword = data.get("confirm_password");

    setRegisterPasswordError("");

    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      setRegisterPasswordError("Passwords do not match");
      return;
    }
  };

  useEffect(() => {
    testWs.current = new WebSocketConnection();
    testWs.current.sendMessage("Hello from the client");

    return () => {
      if (testWs.current) {
        testWs.current.close();
      }
    };
  });

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
          <LabeledInput type="text" label="Username" name="login" required />
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
