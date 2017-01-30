import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { AuthService } from "../../services/auth";

import { CreatePractitionerComponent } from "./create";
import { UpdatePractitionerComponent } from "./update";
import { ListPractitionerComponent } from "./list";
import { PasswordPractitionerComponent } from "./passwd";

export const routes = [
    {path: "practitioner/create", component: CreatePractitionerComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "practitioner/list", component: ListPractitionerComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "practitioner/update/:id", component: UpdatePractitionerComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "practitioner/passwd/:id", component: PasswordPractitionerComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} }
];

