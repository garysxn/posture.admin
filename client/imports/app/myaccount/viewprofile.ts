import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Observable, Subscription, Subject} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import { InjectUser } from "angular2-meteor-accounts-ui";
import {MeteorComponent} from 'angular2-meteor';
import { User } from "../../../../both/models/user.model";
import template from './viewprofile.html';


@Component({
  selector: '',
  template
})
@InjectUser("user")
export class UserDetailsComponent extends MeteorComponent implements OnInit {
  userId: string;
  user: User;
  paramsSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
      super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
        .map(params => params['Meteor.userId()'])
        .subscribe(userId => {
            this.userId = Meteor.userId();
          //  console.log("userId:", Meteor.userId());

            this.call("users.findOne", Meteor.userId(), (err, res)=> {
                if (err) {
                    //console.log("error while fetching user data:", err);
                    return;
                }
                this.user= res;
            });

        });
  }

}
