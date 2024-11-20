/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import { classList } from "../../lib/string";
import styles from "./Button.module.css";

export interface Props {
  type: "button" | "submit";
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
}

export default function Button({
  type,
  children,
  variant = "secondary",
}: Props) {
  return (
    <button type={type} className={classList(styles.button, variant)}>
      {children}
    </button>
  );
}
