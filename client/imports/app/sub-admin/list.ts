import { Meteor } from "meteor/meteor";
import {Component, OnInit, OnDestroy, NgZone, AfterViewInit} from "@angular/core";
import {Observable, Subscription, Subject, BehaviorSubject} from "rxjs";
import {PaginationService} from "ng2-pagination";
import {MeteorObservable} from "meteor-rxjs";
import {InjectUser} from "angular2-meteor-accounts-ui";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { ChangeDetectorRef } from "@angular/core";
import { LocalStorageService } from 'angular-2-local-storage';
import { User } from "../../../../both/models/user.model";
import {showAlert} from "../shared/show-alert";
import { Roles } from 'meteor/alanning:roles';

import template from "./list.html";

interface Pagination {
  limit: number;
  skip: number;
}

interface Options extends Pagination {
  [key: string]: any
}

declare var jQuery:any;

@Component({
  selector: '',
  template
})
export class ListSubadminComponent extends MeteorComponent implements OnInit {
    items: User[];
    pageSize: Subject<number> = new Subject<number>();
    curPage: Subject<number> = new Subject<number>();
    nameOrder: Subject<number> = new Subject<number>();
    optionsSub: Subscription;
    itemsSize: number = 0;
    searchSubject: Subject<string> = new Subject<string>();
    searchString: string = "";

    constructor(private router: Router, 
        private route: ActivatedRoute,
        private paginationService: PaginationService, 
        private ngZone: NgZone, 
        private changeDetectorRef: ChangeDetectorRef,
        private localStorageService: LocalStorageService
    ) {
        super();
    }

    ngOnInit() {
        this.optionsSub = Observable.combineLatest(
            this.pageSize,
            this.curPage,
            this.nameOrder,
            this.searchSubject
        ).subscribe(([pageSize, curPage, nameOrder, searchString]) => {
            const options: Options = {
                limit: pageSize as number,
                skip: ((curPage as number) - 1) * (pageSize as number),
                sort: { "profile.firstName": nameOrder as number }
            };
            this.localStorageService.set("subadmin-list.options", {
                pageSize: pageSize,
                curPage: curPage,
                nameOrder: nameOrder,
                searchString: searchString
            });

            this.paginationService.setCurrentPage(this.paginationService.defaultId, curPage as number);

            //console.log("options:", options);
            //console.log("searchString:", this.searchString);
            this.searchString = searchString;
            jQuery(".loading").show();
            this.call("users.find", options, {roles: ["sub-admin", "moderator"]}, searchString, (err, res) => {
                //console.log("patients.find() done");
                jQuery(".loading").hide();
                if (err) {
                    //console.log("error while fetching patient list:", err);
                    showAlert("Error while fetching users list.", "danger");
                    return;
                }
                this.items = res.data;
                this.itemsSize = res.count;
                this.paginationService.setTotalItems(this.paginationService.defaultId, this.itemsSize);

                setTimeout(function(){
                    jQuery(function($){
                    /*$('.tooltipped').tooltip({delay: 0});*/
                    });
                }, 200);
            })

        });

        let options:any = this.localStorageService.get("subadmin-list.options");
        //console.log("patient-list.options:", options);

        if (!!options) {
            if (! options.limit) {
                options.limit = 10;
            } else {
                options.limit = Number(options.limit);
            }

            if (! options.curPage) {
                options.curPage = 1;
            } else {
                options.curPage = Number(options.curPage);
            }

            if (! options.nameOrder) {
                options.nameOrder = 1;
            } else {
                options.nameOrder = Number(options.nameOrder);
            }

            if (! options.searchString) {
                options.searchString = '';
            }
        } else {
            options = {
                limit: 10,
                curPage: 1,
                nameOrder: 1,
                searchString: '',
            }
        }

        this.paginationService.register({
        id: this.paginationService.defaultId,
        itemsPerPage: 10,
        currentPage: options.curPage,
        totalItems: this.itemsSize
        });

        this.pageSize.next(options.limit);
        this.curPage.next(options.curPage);
        this.nameOrder.next(options.nameOrder);
        this.searchSubject.next(options.searchString);
    }

    search(value: string): void {
        this.searchSubject.next(value);
    }

    onPageChanged(page: number): void {
        this.curPage.next(page);
    }

    changeSortOrder(nameOrder: string): void {
        this.nameOrder.next(parseInt(nameOrder));
    }

    activate(user: User) {
        if (! confirm("Are you sure to activate this record?")) {
            return false;
        }

        Meteor.call("users.activate", user._id, (err, res) => {
            if (err) {
                showAlert("Error calling users.activate", "danger");
                return;
            }
            user.active = true;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("User has been activated.", "success");
        })
    }

    deactivate(user: User) {
        if (! confirm("Are you sure to deactivate this record?")) {
            return false;
        }

        Meteor.call("users.deactivate", user._id, (err, res) => {
            if (err) {
                showAlert("Error calling users.deactivate", "danger");
                return;
            }
            user.active = false;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("User has been deactivated.", "success");
        })
    }

    deleteUser(user: User) {
        if (! confirm("Are you sure to delete this record?")) {
            return false;
        }

        Meteor.call("users.delete", user._id, (err, res) => {
            if (err) {
                showAlert("Error calling users.delete", "danger");
                return;
            }
            //set user.deleted to true to remove from list
            user.deleted = true;
            //angular2 waits for dom event to detect changes automatically
            //so trigger change detection manually to update dom
            this.changeDetectorRef.detectChanges();
            showAlert("User has been removed.", "success");
        })
    }

    ngOnDestroy() {
        this.optionsSub.unsubscribe();
    }

    ngAfterViewInit() {
        jQuery(function($){
        /*$('select').material_select();
        $('.tooltipped').tooltip({delay: 50});*/
        })
    }
}