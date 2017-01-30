import { Meteor } from 'meteor/meteor';
import { Injectable, NgZone } from '@angular/core';
import { CanActivate } from '@angular/router';
import {Observable} from "rxjs";
import { Router, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Roles } from 'meteor/alanning:roles';
import {showAlert} from "../app/shared/show-alert";
import { UserService } from './user';

@Injectable()
export class AuthService implements CanActivate {
  constructor(private user: UserService, private router: Router, private zone: NgZone) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot
  ): Observable<boolean>|Promise<boolean>|boolean {
    let roles = route.data["roles"] as Array<string>;

    if (! Roles.userIsInRole(Meteor.userId(), roles) ) {

      if (this.user.isLoggedIn()) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
        //showAlert("You are not authorized to access this page.", "danger");
      }

      return false;
    }

    return true;
  }
}