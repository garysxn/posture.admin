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
export class UpdateSubadminComponent extends MeteorComponent implements OnInit {
  paramsSub: Subscription;
  userId: string;
  createForm: FormGroup;
  error: string;
  rolesArray: [{label: string, value: string}] = [
    {label: "Author", value: "author"},
    {label: "Moderator", value: "moderator"}
    ];
  rolesBoxArray: FormArray;

  constructor(private router: Router, private route: ActivatedRoute, private zone: NgZone, private formBuilder: FormBuilder) {
    super();

    this.rolesBoxArray = new FormArray( [], this.rolesRequired );
    for( let r in this.rolesArray ) {
      this.rolesBoxArray.push( new FormControl() )
    }
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
                    this.router.navigate(['/sub-admin/list']);
                  });
                  return;
              }
              this.createForm.controls['firstName'].setValue(res.profile.firstName);
              this.createForm.controls['lastName'].setValue(res.profile.lastName);
              this.createForm.controls['phoneNum'].setValue(res.profile.contact);
              //console.log("this.rolesBoxArray:", this.rolesBoxArray);
              for(let i=0; i<res.roles.length; i++) {
                let role = res.roles[i];
                for(let i2=0; i2<this.rolesArray.length; i2++) {
                  if (this.rolesArray[i2].value == role) {
                    this.rolesBoxArray.controls[i2].setValue(true);
                  }
                }
              }
          });

      });

    this.createForm = this.formBuilder.group({
      firstName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
      lastName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
      phoneNum: ['', Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(15), validatePhoneNum])],
      roles: this.rolesBoxArray
    });

    this.error = '';
  }

  rolesRequired(formArray: FormArray) {
    let valid = false;
      for( let c in formArray.controls ) {
        if( formArray.controls[c].value == true ) { valid = true }
      }
      return valid == true ? null : { required: true }
  }

  onSubmit() {
    let roles = ["sub-admin"];
    for (let i=0; i<this.createForm.value.roles.length; i++) {
      if (this.createForm.value.roles[i] === true) {
        roles.push(this.rolesArray[i].value);
      }
    }

    if (!this.createForm.valid) {
      showAlert("Invalid form-data supplied.", "danger");
      return;
    }

    // update old user
    let userData = {
      "profile.firstName": this.createForm.value.firstName,
      "profile.lastName": this.createForm.value.lastName,
      "profile.contact": this.createForm.value.phoneNum,
      "roles": roles
    };

    this.call("users.update", this.userId, userData, (err, res) => {
      if (err) {
        this.zone.run(() => {
          this.error = err;
        });
      } else {
        showAlert("User profile updated successfully.", "success");
        this.zone.run(() => {
          this.router.navigate(['/sub-admin/list']);
        });
      }
    });
    // finish update old user
  }
}