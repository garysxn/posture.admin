import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import {check} from "meteor/check";
import {Emails} from "../../both/collections/email.collection";
import {Email} from "../../both/models/email.model";
import {isValidSlug} from "../../both/validators";
import * as _ from 'underscore';

interface Options {
  [key: string]: any;
}

Meteor.methods({
    "emails.insert": (emailData: Email) => {
        try {
            validateEmailData(emailData);
        } catch (err) {
            let errMesg = err.reason || `Invalid formData supplied.`;
            throw new Meteor.Error(403, errMesg);
        }
        let emailId = Emails.collection.insert(emailData);

        return emailId;
    },
    "emails.update": (emailId: string, emailData: Email) => {
        try {
            validateEmailData(emailData);
        } catch (err) {
            let errMesg = err.reason || `Invalid formData supplied.`;
            throw new Meteor.Error(403, errMesg);
        }
        return Emails.collection.update({_id: emailId}, {$set: emailData});
    },
    "emails.find": (options: Options, criteria: any, searchString: string) => {
        let where:any = [];
        where.push({
            "$or": [{deleted: false}, {deleted: {$exists: false} }]
        });
        
        // match search string
        if (typeof searchString === 'string' && searchString.length) {
            // allow search on firstName, lastName
            where.push({"$or": [
                {"title": {$regex: `.*${searchString}.*`,$options : 'i'} },
                {"heading": {$regex: `.*${searchString}.*`,$options : 'i'} },
            ]} );
        }

        // restrict db fields to return
        _.extend(options, {
            //fields: {"emails.address": 1, "patient": 1, "createdAt": 1, "status": 1}
        });

        //console.log("where:", where);
        //console.log("options:", options);
        // execute find query
        let cursor = Emails.collection.find({$and: where}, options);
        return {count: cursor.count(), data: cursor.fetch()};
    },
    "emails.findOne": (emailId: string) => {
        return Emails.collection.findOne({_id: emailId});
    },
    "emails.delete": (emailId: string) => {
        return Emails.collection.update({_id: emailId}, {$set: {
            deleted: true
        } });
    },
    "emails.activate": (emailId: string) => {
        return Emails.collection.update({_id: emailId}, {$set: {
            active: true
        } });
    },
    "emails.deactivate": (emailId: string) => {
        return Emails.collection.update({_id: emailId}, {$set: {
            active: false
        } });
    }
});

function validateEmailData(emailData: Email) {
    /* validate title */
    let titleLen = emailData.title.length;
    if (titleLen < 8 || titleLen > 255) {
        throw new Meteor.Error(403, `Invalid title supplied.`);
    }
    /* validate heading */
    let headingLen = emailData.heading.length;
    if (headingLen < 8 || headingLen > 255) {
        throw new Meteor.Error(403, `Invalid heading supplied.`);
    }
    /* validate summary */
    let summaryLen = emailData.summary.length;
    if (summaryLen < 8 || summaryLen > 255) {
        throw new Meteor.Error(403, `Invalid summary supplied.`);
    }
    /* validate contents */
    let contentsLen = emailData.contents.length;
    if (contentsLen < 8) {
        throw new Meteor.Error(403, `Invalid contents supplied.`);
    }

    return true;
}