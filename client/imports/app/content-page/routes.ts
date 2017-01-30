import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import { CreatePageComponent } from "./create";
import { ListPageComponent } from "./list";
import { ViewPageComponent } from "./view";

export const routes = [
    {path: "page/create", component: CreatePageComponent},
    {path: "page/update/:id", component: CreatePageComponent},
    {path: "page/list", component: ListPageComponent},
    {path: "page/view/:id", component: ViewPageComponent}
];

