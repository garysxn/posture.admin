import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';
import { CreateEmailComponent } from "./create";
import { ListEmailComponent } from "./list";


export const routes = [
    {path: "email/create", component: CreateEmailComponent},
    {path: "email/update/:id", component: CreateEmailComponent},
    {path: "email/list", component: ListEmailComponent},
];

