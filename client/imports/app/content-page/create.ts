import { Meteor } from 'meteor/meteor';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Subscription } from "rxjs";
import { Page } from "../../../../both/models/page.model";
import {showAlert} from "../shared/show-alert";
import {validateSlug} from "../../validators/common";
import { Roles } from 'meteor/alanning:roles';

import template from "./create.html";

@Component({
  selector: '',
  template
})
export class CreatePageComponent extends MeteorComponent implements OnInit, OnDestroy {
  paramsSub: Subscription;
  pageId: string;
  createForm: FormGroup;
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
          this.pageId = id;
          //console.log("patientId:", patientId);
  
          if (! this.pageId) {
            //console.log("no page-id supplied");
            return;
          }

          this.call("pages.findOne", id, (err, res)=> {
              if (err || typeof res == "undefined" || res._id !== id) {
                  //console.log("error while fetching patient data:", err);
                  showAlert("Error while fetching page data.", "danger");
                  this.zone.run(() => {
                    this.router.navigate(['/page/list']);
                  });
                  return;
              }
              this.createForm.controls['title'].setValue(res.title);
              this.createForm.controls['heading'].setValue(res.heading);
              this.createForm.controls['slug'].setValue(res.slug);
              this.createForm.controls['summary'].setValue(res.summary);
              this.createForm.controls['contents'].setValue(res.contents);
          });

      });

    this.createForm = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255)])],
      heading: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255)])],
      summary: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255)])],
      slug: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(50), validateSlug])],
      contents: ['', Validators.compose([Validators.required])],
    });

    this.error = '';

    // CKEDITOR.replace( 'contents' );
  }

  onSubmit() {
    if (!this.createForm.valid) {
      console.log(this.createForm);
      showAlert("Invalid form-data supplied.", "danger");
      return;
    }

    // insert new page
    if (!this.pageId) {
      let pageData = {
        title: this.createForm.value.title,
        heading: this.createForm.value.heading,
        summary: this.createForm.value.summary,
        contents: this.createForm.value.contents,
        slug: this.createForm.value.slug,
        ownerId: Meteor.userId(),
        active: true,
        deleted: false
      };
      this.call("pages.insert", pageData, (err, res) => {
        if (err) {
          this.zone.run(() => {
            this.error = err;
          });
        } else {
          //console.log("new user-id:", res);
          showAlert("New page saved successfully.", "success");
          this.zone.run(() => {
            this.router.navigate(['/page/list']);
          });
        }
      });
    }
    // finish insert new page
    // update page data
    else {
      let pageData = {
        title: this.createForm.value.title,
        heading: this.createForm.value.heading,
        summary: this.createForm.value.summary,
        contents: this.createForm.value.contents,
        slug: this.createForm.value.slug
      }
      this.call("pages.update", this.pageId, pageData, (err, res) => {
        if (err) {
          this.zone.run(() => {
            this.error = err;
          });
        } else {
          //console.log("new user-id:", res);
          showAlert("Page data updated successfully.", "success");
          this.zone.run(() => {
            this.router.navigate(['/page/list']);
          });
        }
      });
    }
    // finish update page data
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
  }
}