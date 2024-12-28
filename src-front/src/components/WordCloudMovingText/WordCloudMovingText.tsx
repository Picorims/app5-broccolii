/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import styles from "./WordCloudMovingText.module.css";

export interface Props {
  text: string;
}

export default function WordCloudMovingText({ text }: Props) {
  return (
    <div className={styles.container}>
      <span className={styles.text}>{text}</span>
      {/* svg filter adding a border to the text */}
      <svg>
        <defs>
          <filter id="border" x="-50%" y="-50%" width="200%" height="200%">
            <feMorphology
              operator="dilate"
              radius="10"
              in="SourceAlpha"
              result="border"
            />
            {/* text-950 in color_palette.css */}
            <feFlood floodColor="#001a05" result="borderColor" />
            <feComposite
              in="border"
              in2="borderColor"
              operator="in"
              result="border"
            />
            <feComposite in="SourceGraphic" in2="border" operator="over" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
