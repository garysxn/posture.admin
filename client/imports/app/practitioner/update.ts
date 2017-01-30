import { Meteor } from "meteor/meteor";
import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Subscription } from "rxjs";
import { User } from "../../../../both/models/user.model";
import {showAlert} from "../shared/show-alert";
import {validateEmail, validatePhoneNum, validateFirstName} from "../../validators/common";
import { Roles } from 'meteor/alanning:roles';

import template from "./update.html";

@Component({
  selector: '',
  template
})
export class UpdatePractitionerComponent extends MeteorComponent implements OnInit {
  paramsSub: Subscription;
  userId: string;
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
    this.paramsSub = this.route.params
      .map(params => params['id'])
      .subscribe(id => {
          this.userId = id;
          //console.log("patientId:", patientId);
  
          this.call("users.findOne", id, (err, res)=> {
              if (err || typeof res == "undefined" || res._id !== id) {
                  //console.log("error while fetching patient data:", err);
                  showAlert("Error while fetching user data.", "danger");
                  this.zone.run(() => {
                    this.router.navigate(['/practitioner/list']);
                  });
                  return;
              }
              this.createForm.controls['firstName'].setValue(res.profile.firstName);
              this.createForm.controls['lastName'].setValue(res.profile.lastName);
              this.createForm.controls['phoneNum'].setValue(res.profile.contact);
          });

      });

    this.createForm = this.formBuilder.group({
      firstName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
      lastName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
      phoneNum: ['', Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(15), validatePhoneNum])]
    });

    this.error = '';
  }

  onSubmit() {
    if (!this.createForm.valid) {
      showAlert("Invalid form-data supplied.", "danger");
      return;
    }

    // update old user
    let userData = {
      "profile.firstName": this.createForm.value.firstName,
      "profile.lastName": this.createForm.value.lastName,
      "profile.contact": this.createForm.value.phoneNum,
      "roles": ["practitioner"]
    };

    this.call("users.update", this.userId, userData, (err, res) => {
      if (err) {
        this.zone.run(() => {
          this.error = err;
        });
      } else {
        showAlert("User profile updated successfully.", "success");
        this.zone.run(() => {
          this.router.navigate(['/practitioner/list']);
        });
      }
    });
    // finish update old user
  }
}