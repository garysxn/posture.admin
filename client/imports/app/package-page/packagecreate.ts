import { Meteor } from 'meteor/meteor';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Subscription } from "rxjs";
import { Package } from "../../../../both/models/package.model";
import { DropdownModule } from "ng2-dropdown";
import { showAlert } from "../shared/show-alert";
import { validateFirstName, validateSlug, validateMinVal, validateMaxVal } from "../../validators/common";

import template from "./packagecreate.html";

@Component({
  selector: '',
  template
})
export class CreatePackageComponent extends MeteorComponent implements OnInit, OnDestroy {
  paramsSub: Subscription;
  packageId: string;
  packageForm: FormGroup;
  error: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    private formBuilder: FormBuilder
  ) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['id'])
      .subscribe(id => {
        this.packageId = id;
        //console.log("patientId:", patientId);

        if (!this.packageId) {
          //console.log("no page-id supplied");
          return;
        }

        this.call("packages.findOne", id, (err, res) => {
          if (err || typeof res == "undefined" || res._id !== id) {
            //console.log("error while fetching patient data:", err);
            showAlert("Error while fetching package data.", "danger");
            this.zone.run(() => {
              this.router.navigate(['/package/list']);
            });
            return;
          }
          this.packageForm.controls['title'].setValue(res.title);
          this.packageForm.controls['code'].setValue(res.code);
          this.packageForm.controls['summary'].setValue(res.summary);
          this.packageForm.controls['maxDevices'].setValue(res.maxDevices);
          this.packageForm.controls['maxPatients'].setValue(res.maxPatients);
          this.packageForm.controls['pricePerPatient'].setValue(res.pricePerPatient);
          this.packageForm.controls['pricePerDevice'].setValue(res.pricePerDevice);
          this.packageForm.controls['durationInMonths'].setValue(res.durationInMonths);
        });

      });

    this.packageForm = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255), validateFirstName])],
      code: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30), validateSlug])],
      summary: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255)])],
      maxDevices: ['', Validators.compose([Validators.required, validateMinVal(1), validateMaxVal(25)])], 
      maxPatients: ['', Validators.compose([Validators.required, validateMinVal(1), validateMaxVal(50)])],
      pricePerPatient: ['', Validators.compose([Validators.required, validateMinVal(0.25), validateMaxVal(10)])],
      pricePerDevice: ['', Validators.compose([Validators.required, validateMinVal(25), validateMaxVal(500)])],
      durationInMonths: ['', Validators.compose([Validators.required, validateMinVal(1), validateMaxVal(36)])],
    });

    this.error = '';

  }

  onSubmit() {
    if (!this.packageForm.valid) {
      console.log(this.packageForm);
      showAlert("Invalid data supplied.", "danger");
      return;
    }

    let durationInDays = parseInt(this.packageForm.value.durationInMonths) * 30;

    // insert new page
    if (!this.packageId) {
      let packageData = {
        title: this.packageForm.value.title,
        code: this.packageForm.value.code,
        summary: this.packageForm.value.summary,
        maxDevices: this.packageForm.value.maxDevices,
        maxPatients: this.packageForm.value.maxPatients,
        pricePerPatient: this.packageForm.value.pricePerPatient,
        pricePerDevice: this.packageForm.value.pricePerDevice,
        durationInMonths: this.packageForm.value.durationInMonths,
        durationInDays: durationInDays,
        ownerId: Meteor.userId(),
        active: true,
        deleted: false
      };
      this.call("packages.insert", packageData, (err, res) => {
        if (err) {
          this.zone.run(() => {
            this.error = err;
          });
        } else {
          //console.log("new user-id:", res);
          showAlert("New package saved successfully.", "success");
          this.zone.run(() => {
            this.router.navigate(['/package/list']);
          });
        }
      });
    }
    // finish insert new page
    // update package data
    else {
      let packageData = {
        title: this.packageForm.value.title,
        code: this.packageForm.value.code,
        summary: this.packageForm.value.summary,
        maxDevices: this.packageForm.value.maxDevices,
        maxPatients: this.packageForm.value.maxPatients,
        pricePerPatient: this.packageForm.value.pricePerPatient,
        pricePerDevice: this.packageForm.value.pricePerDevice,
        durationInMonths: this.packageForm.value.durationInMonths,
        durationInDays: durationInDays,
      }
      this.call("packages.update", this.packageId, packageData, (err, res) => {
        if (err) {
          this.zone.run(() => {
            this.error = err;
          });
        } else {
          //console.log("new user-id:", res);
          showAlert("Package data updated successfully.", "success");
          this.zone.run(() => {
            this.router.navigate(['/package/list']);
          });
        }
      });
    }
    // finish update package data
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
  }
}
