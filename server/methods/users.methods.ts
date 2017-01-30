import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import {check} from "meteor/check";
import {isValidEmail, isValidFirstName, isValidPhoneNum, isValidSSN, isValidPasswd} from "../../both/validators";
import * as _ from 'underscore';

interface Options {
  [key: string]: any;
}

Meteor.methods({
    "users.insert": (userData: {email: string, passwd: string, profile?: any}, roles: [string]): string => {
        /* validate email */
        check(userData.email, String);
        if (! isValidEmail(userData.email) ) {
            throw new Meteor.Error(`Invalid email ${userData.email}`);
        }
        /* validate password */
        if (! isValidPasswd(userData.passwd)) {
            throw new Meteor.Error(`Invalid password supplied.`);
        }
        /* validate first name */
        check(userData.profile.firstName, String);
        if (! isValidFirstName(userData.profile.firstName)) {
            throw new Meteor.Error(`Invalid first name ${userData.profile.firstName}`);
        }
        /* validate last name */
        check(userData.profile.lastName, String);
        if (! isValidFirstName(userData.profile.lastName)) {
            throw new Meteor.Error(`Invalid last name ${userData.profile.lastName}`);
        }
        /* valiate contact */
        check(userData.profile.contact, String);
        if (! isValidPhoneNum(userData.profile.contact)) {
            throw new Meteor.Error(`Invalid contact ${userData.profile.contact}`);
        }
        
        let userId = Accounts.createUser({
            email: userData.email,
            password: userData.passwd,
            profile: userData.profile
        });

        if (typeof roles == "undefined" || !roles.length) {
            roles = ["standard"];
        }
        Roles.addUsersToRoles(userId, roles);

        return userId;
    },
    "users.find": (options: Options, criteria: {roles: [string]}, searchString: string) => {
        let where:any = [];
        where.push({
            "$or": [{deleted: false}, {deleted: {$exists: false} }]
        });
        // match user roles
        if (typeof criteria.roles !== "undefined") {
            where.push({"roles": {$in: criteria.roles} });
        }
        // match search string
        if (typeof searchString === 'string' && searchString.length) {
            // allow search on firstName, lastName
            where.push({"$or": [
                {"profile.firstName": {$regex: `.*${searchString}.*`,$options : 'i'} },
                {"profile.lastName": {$regex: `.*${searchString}.*`,$options : 'i'} }
            ]} );
        }

        // restrict db fields to return
        _.extend(options, {
            //fields: {"emails.address": 1, "patient": 1, "createdAt": 1, "status": 1}
        });

        //console.log("where:", where);
        //console.log("options:", options);
        // execute find query
        let cursor = Meteor.users.find({$and: where}, options);
        return {count: cursor.count(), data: cursor.fetch()};
    },
    "users.findOne": (userId: string) => {
        return Meteor.users.findOne({_id: userId});
    },
    "users.update": (userId: string, userData: any) => {
        check(userData["profile.firstName"], String);
        if (! isValidFirstName(userData["profile.firstName"])) {
            throw new Meteor.Error(`Invalid firstName ${userData.profile.firstName}`);
        }
        check(userData["profile.lastName"], String);
        if (! isValidFirstName(userData["profile.lastName"])) {
            throw new Meteor.Error(`Invalid lastName ${userData.profile.lastName}`);
        }
        check(userData["profile.contact"], String);
        if (! isValidPhoneNum(userData["profile.contact"])) {
            throw new Meteor.Error(`Invalid phoneNum ${userData.profile.contact}`);
        }

        return Meteor.users.update({_id: userId}, {$set: userData});
    },
    "users.delete": (userId: string) => {
        return Meteor.users.update({_id: userId}, {$set: {
            "deleted": true
        }});
    },
    "users.deactivate": (userId: string) => {
        return Meteor.users.update({_id: userId}, {$set: {
            "active": false
        }});
    },
    "users.activate": (userId: string) => {
        return Meteor.users.update({_id: userId}, {$set: {
            "active": true
        }});
    },
    "users.resetPasswd": (userId: string, newPasswd: string) => {
        /* validate password */
        if (! isValidPasswd(newPasswd)) {
            throw new Meteor.Error(`Invalid password supplied.`);
        }
        return Accounts.setPassword(userId, newPasswd);
    }
})