import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import {SignupComponent} from "./auth/singup.component";
import {RecoverComponent} from "./auth/recover.component";
import {LoginComponent} from "./auth/login.component.web";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {LandingComponent} from "./layout/landing.component";
import {routes as subadminRoutes} from "./sub-admin/routes";
import {routes as pageRoutes} from "./content-page/routes";
import {routes as packageRoutes} from "./package-page/routes";
import {routes as practitionerRoutes} from "./practitioner/routes";
import {routes as accountRoutes} from "./myaccount/route";
import {routes as emailRoutes} from "./email/routes";
 
let mainRoutes = [
    { path: '', component: LandingComponent/*, canActivate: ['canActivateForLogoff']*/ },
    { path: 'dashboard', component: DashboardComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'login', component: LoginComponent },
    //{ path: 'signup', component: SignupComponent },
    { path: 'recover', component: RecoverComponent }
];

export const routes: Route[] = [
    ...mainRoutes,
    ...subadminRoutes,
    ...pageRoutes,
    ...practitionerRoutes,
    ...packageRoutes,
    ...accountRoutes, 
    ...emailRoutes 
];

export const ROUTES_PROVIDERS = [
    {
        provide: 'canActivateForLoggedIn',
        useValue: () => !! Meteor.userId()
    },
    {
        provide: 'canActivateForLogoff',
        useValue: () => ! Meteor.userId()
    },
];
