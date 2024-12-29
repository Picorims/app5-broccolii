/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import React, { useEffect } from "react";

export interface Props {
  bodyNamespace: string;
  children: React.ReactNode;
}

export default function BasePage({ bodyNamespace, children }: Props) {
  useEffect(() => {
    document.body.classList.add(bodyNamespace);
    return () => {
      document.body.classList.remove(bodyNamespace);
    };
  });

  return children;
}
