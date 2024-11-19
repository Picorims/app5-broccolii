/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import styles from "./LabeledInput.module.css";

export interface Props {
    type: "text" | "password";
    label: string;
}

export default function LabeledInput({ type, label }: Props) {
    return (
        <div>
            <label className={styles.label}>
                <span>{label}</span>
                <input type={type} className={styles.input} />
            </label>
        </div>
    );
};
