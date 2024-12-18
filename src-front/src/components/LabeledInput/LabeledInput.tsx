/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { FormEvent, useEffect, useRef } from "react";
import styles from "./LabeledInput.module.css";

export interface Props {
  type: "text" | "password";
  label: string;
  name?: string;
  error?: string;
  required?: boolean;
}

export default function LabeledInput({
  type,
  label,
  name,
  error = "",
  required = false,
}: Props) {
  const onInput = (e: FormEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).setCustomValidity("");
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error !== "") {
      inputRef.current?.setCustomValidity(error);
      inputRef.current?.reportValidity();
    }
  }, [error]);

  return (
    <div>
      <label className={styles.label}>
        <span>{label}</span>
        <input
          type={type}
          className={styles.input}
          name={name}
          onInput={onInput}
          ref={inputRef}
          required={required}
        />
      </label>
      {error !== "" && <span className={styles.error}>{error}</span>}
    </div>
  );
}
