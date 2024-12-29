/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

export type EnvironmentType = "dev" | "prod";
export interface Environment {
  backendUrl: string;
  backendWebSocketUrl: string;
}

export const environment: Record<EnvironmentType, Environment> = {
  dev: {
    backendUrl: "http://localhost:8000", // consider using / with a proxy on vite side when in dev (in prod it must be on the same port then)
    backendWebSocketUrl: "ws://localhost:8000",
  },
  prod: {
    backendUrl: "http://broccolii.picorims.fr", 
    backendWebSocketUrl: "ws://broccolii.picorims.fr",
  },
};

export function getEnv(): Environment {
  const viteEnv = import.meta.env.MODE;
  if (viteEnv === "development") {
    return environment["dev"];
  } else if (viteEnv === "production") {
    return environment["prod"];
  } else {
    throw new Error("Unknown environment.");
  }
}
