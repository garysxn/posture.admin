import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { AuthService } from "../../services/auth";

import { CreateSubadminComponent } from "./create";
import { UpdateSubadminComponent } from "./update";
import { ListSubadminComponent } from "./list";
import { PasswordSubadminComponent } from "./passwd";

export const routes = [
    {path: "sub-admin/create", component: CreateSubadminComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "sub-admin/list", component: ListSubadminComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "sub-admin/update/:id", component: UpdateSubadminComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} },
    {path: "sub-admin/passwd/:id", component: PasswordSubadminComponent, canActivate: [AuthService], data: {'roles': ['super-admin']} }
];

