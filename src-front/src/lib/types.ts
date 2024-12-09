/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

// from: https://stackoverflow.com/questions/38123222/proper-way-to-declare-json-object-in-typescript
export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = (JsonPrimitive | JsonObject | JsonArray)[];
export interface JsonObject {
    [key: string]: JsonPrimitive | JsonObject | JsonArray;
}

export type JsonLike = JsonArray | JsonObject | JsonPrimitive;