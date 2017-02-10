import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { isValidEmail, isValidFirstName, isValidPhoneNum, isValidSSN, isValidPasswd } from "../../both/validators";
import { Images, Thumbs } from "../../both/collections/images.collection";
import { Image, Thumb } from "../../both/models/image.model";
import { isLoggedIn, userIsInRole } from "../imports/services/auth";
import * as _ from 'underscore';

interface Options {
    [key: string]: any;
}

Meteor.methods({
    /* insert a new user */
    "users.insert": (userData: { email: string, passwd: string, profile?: any }, roles: [string]): string => {
        /* validate email */
        check(userData.email, String);
        if (!isValidEmail(userData.email)) {
            throw new Meteor.Error(`Invalid email ${userData.email}`);
        }
        /* validate password */
        if (!isValidPasswd(userData.passwd)) {
            throw new Meteor.Error(`Invalid password supplied.`);
        }
        /* validate first name */
        check(userData.profile.firstName, String);
        if (!isValidFirstName(userData.profile.firstName)) {
            throw new Meteor.Error(`Invalid first name ${userData.profile.firstName}`);
        }
        /* validate last name */
        check(userData.profile.lastName, String);
        if (!isValidFirstName(userData.profile.lastName)) {
            throw new Meteor.Error(`Invalid last name ${userData.profile.lastName}`);
        }
        /* valiate contact */
        check(userData.profile.contact, String);
        if (!isValidPhoneNum(userData.profile.contact)) {
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
    /* find users and search */
    "users.find": (options: Options, criteria: any, searchString: string) => {
        userIsInRole(["super-admin"]);

        let where:any = [];
        
        // exclude deleted items
        where.push({
            "$or": [{ deleted: false }, { deleted: { $exists: false } }]
        });

        // merge criteria to where
        if (! _.isEmpty(criteria)) {
            where.push(criteria);
        }

        // match search string
        if (typeof searchString === 'string' && searchString.length) {
            // allow search on firstName, lastName
            where.push({
                "$or": [
                    { "profile.firstName": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "profile.lastName": { $regex: `.*${searchString}.*`, $options: 'i' } }
                ]
            });
        }

        // restrict db fields to return
        _.extend(options, {
            //fields: {"emails.address": 1, "patient": 1, "createdAt": 1, "status": 1}
        });

        //console.log("where:", where);
        //console.log("options:", options);
        // execute find query
        let cursor = Meteor.users.find({ $and: where }, options);
        return { count: cursor.count(), data: cursor.fetch() };

    },
    /* get users count */
    "users.count": (criteria: any, searchString: string): number => {
        userIsInRole(["super-admin", "sub-admin"]);
        let where: any = [];
        where.push({
            "$or": [{ deleted: false }, { deleted: { $exists: false } }]
        });
        // match user roles
        if (!_.isEmpty(criteria)) {
            where.push(criteria);
        }
        // match search string
        if (typeof searchString === 'string' && searchString.length) {
            // allow search on firstName, lastName
            where.push({
                "$or": [
                    { "profile.firstName": { $regex: `.*${searchString}.*` } },
                    { "profile.lastName": { $regex: `.*${searchString}.*` } }
                ]
            });
        }

        return Meteor.users.find({ $and: where }).count();
    },
    /* find single user */
    "users.findOne": (userId: string) => {
        return Meteor.users.findOne({ _id: userId });
    },
    /* update user data */
    "users.update": (userId: string, userData: any) => {
        userIsInRole(["super-admin"]);
        // validate firstName if present in userData
        if (typeof userData["profile.firstName"] !== "undefined") {
            check(userData["profile.firstName"], String);
            if (!isValidFirstName(userData["profile.firstName"])) {
                throw new Meteor.Error(`Invalid firstName ${userData.profile.firstName}`);
            }
        }

        // validate lastName if present in userData
        if (typeof userData["profile.lastName"] !== "undefined") {
            check(userData["profile.lastName"], String);
            if (!isValidFirstName(userData["profile.lastName"])) {
                throw new Meteor.Error(`Invalid lastName ${userData.profile.lastName}`);
            }
        }

        // validate contact if present in userData
        if (typeof userData["profile.contact"] !== "undefined") {
            check(userData["profile.contact"], String);
            if (!isValidPhoneNum(userData["profile.contact"])) {
                throw new Meteor.Error(`Invalid phoneNum ${userData.profile.contact}`);
            }
        }

        return Meteor.users.update({ _id: userId }, { $set: userData });
    },
    /* delete a user */
    "users.delete": (userId: string) => {
        userIsInRole(["super-admin"]);

        return Meteor.users.update({ _id: userId }, {
            $set: {
                "deleted": true
            }
        });
    },
    /* deactivate a user */
    "users.deactivate": (userId: string) => {
        userIsInRole(["super-admin"]);

        return Meteor.users.update({ _id: userId }, {
            $set: {
                "active": false
            }
        });
    },
    /* activate a user */
    "users.activate": (userId: string) => {
        userIsInRole(["super-admin"]);

        return Meteor.users.update({ _id: userId }, {
            $set: {
                "active": true
            }
        });
    },
    /* reset password of a user */
    "users.resetPasswd": (userId: string, newPasswd: string) => {
        userIsInRole(["super-admin"]);

        /* validate password */
        if (!isValidPasswd(newPasswd)) {
            throw new Meteor.Error(`Invalid password supplied.`);
        }
        return Accounts.setPassword(userId, newPasswd);
    },
    /* delete image of a user */
    "users.deleteImage": () => {
        isLoggedIn();

        let user = Meteor.user();
        let userId = Meteor.userId();
        /* check user */
        /*if (typeof user == "undefined" || user._id !== userId) {
            throw new Meteor.Error(`Invalid user-id "${userId}"`);
        }*/

        /* check if image exists for user */
        if (typeof user.profile.imageId == "undefined" || !user.profile.imageId) {
            throw new Meteor.Error(`Invalid image-id for user "${userId}"`);
        }

        let fs = require('fs');
        /* remove original image */
        let image = Images.collection.findOne({_id: user.profile.imageId});
        if (typeof image == "undefined" || !image._id) {
            throw new Meteor.Error(`Invalid image-id "${user.profile.imageId}"`);
        }
        let imagePath = process.env.PWD + '/uploads/images/' + image._id + '.' + image.extension;
        fs.unlink(imagePath, (res) => {
            //console.log("unlink.img:", res);
        });
        /* reset data in collections */
        Images.collection.remove({_id: image._id});
        Meteor.call("users.update", userId, {"profile.imageId": null, "profile.imageUrl": null});

        /* remove thumb */
        let thumb = Thumbs.collection.findOne({originalId: image._id});
        if (typeof thumb == "undefined" || !thumb._id) {
            return true;
        }

        let thumbPath = process.env.PWD + '/uploads/thumbs/' + thumb._id + '.' + thumb.extension;
        fs.unlink(thumbPath, (res) => {
            //console.log("unlink.thumb:", res);
        });
        Thumbs.collection.remove({_id: thumb._id});

        return true;
    }
});
