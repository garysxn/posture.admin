import { Meteor } from 'meteor/meteor';
import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { User } from "../../../../both/models/user.model";
import {showAlert} from "../shared/show-alert";
import {validateEmail, validatePhoneNum, validateFirstName, validatePassword} from "../../validators/common";
import { Roles } from 'meteor/alanning:roles';

import template from "./create.html";

@Component({
  selector: '',
  template
})
export class CreatePractitionerComponent extends MeteorComponent implements OnInit {
  createForm: FormGroup;
  error: string;
  
  constructor(private router: Router, 
    private route: ActivatedRoute, 
    private zone: NgZone, 
    private formBuilder: FormBuilder) 
  {
    super();
  }

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, validateEmail])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), validatePassword])],
      repeatPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), validatePassword])],
      firstName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
      lastName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
      phoneNum: ['', Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(15), validatePhoneNum])],
    }, {validator: this.matchPasswords('password', 'repeatPassword')});

    this.error = '';
  }

  matchPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup): {[key: string]: any} => {
      let password = group.controls[passwordKey];
      let confirmPassword = group.controls[confirmPasswordKey];
      //console.log("passwd:", password.value);
      //console.log("repeat passwd:", confirmPassword.value);

      if (password.value !== confirmPassword.value) {
        //console.log("password mismatch");
        return {
          "password.mismatch": false
        };
      } else {
        return null;
      }
    }
  }

  onSubmit() {
    let roles = ["practitioner"];

    if (!this.createForm.valid) {
      console.log(this.createForm);
      showAlert("Invalid form-data supplied.", "danger");
      return;
    }

    // insert new user
    let userData = {
      email: this.createForm.value.email,
      passwd: this.createForm.value.password,
      profile: {
        firstName: this.createForm.value.firstName,
        lastName: this.createForm.value.lastName,
        contact: this.createForm.value.phoneNum
      }
    };
    this.call("users.insert", userData, roles, (err, res) => {
      if (err) {
        this.zone.run(() => {
          this.error = err;
        });
      } else {
        //console.log("new user-id:", res);
        showAlert("New user saved successfully.", "success");
        this.zone.run(() => {
          this.router.navigate(['/practitioner/list']);
        });
      }
    });
  }
  // finish insert new user
}