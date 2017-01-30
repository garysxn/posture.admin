import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import {MeteorComponent} from 'angular2-meteor';
import {validateEmail, validatePhoneNum, validateFirstName} from "../../validators/common";

import template from './signup.component.html';

@Component({
  selector: 'signup',
  template
})
export class SignupComponent extends MeteorComponent implements OnInit {
  signupForm: FormGroup;
  error: string;

  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {
    super();
  }

    ngOnInit() {
        this.signupForm = this.formBuilder.group({
          email: ['', Validators.compose([Validators.required, validateEmail])],
          password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
          firstName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
          lastName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
        });
  
        this.error = '';
    }

    signup() {
        if (this.signupForm.valid) {
          let userData = {
            email: this.signupForm.value.email,
            passwd: this.signupForm.value.password,
            profile: {
              firstName: this.signupForm.value.firstName,
              lastName: this.signupForm.value.lastName
            }
          };
          this.call("users.insert", userData, ['super-admin'], (err, res) => {
            if (err) {
              this.zone.run(() => {
                this.error = err;
              });
            } else {
              console.log("new user-id:", res);
              this.router.navigate(['/login']);
            }
          });
        }
    }
}