/*
  Copyright (c) 2024 Charly Schmidt aka Picorims<picorims.contact@gmail.com>,
  Alexis Hu, Olivier Proquez, Arnaud Bulteau, Maxime Le Bot

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import LabeledInput from "../../components/LabeledInput/LabeledInput";

export default function LoginPage() {
    return (
        <>
            <Card>
                <h2>Login</h2>
                <LabeledInput type="text" label="Username" />
                <LabeledInput type="password" label="Password" />
                <Button type="submit" variant="primary">Login</Button>
            </Card >
            <Card>
                <h2>Register</h2>
                <LabeledInput type="text" label="Username" />
                <LabeledInput type="password" label="Password" />
                <LabeledInput type="password" label="Confirm Password" />
                <Button type="submit" variant="primary">Register</Button>
            </Card>
        </>
    );
};
