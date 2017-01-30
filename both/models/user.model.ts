import { Meteor } from 'meteor/meteor';

export interface User extends Meteor.User {
    username: string;
    emails: [
        {
            address: string;
            verified: boolean;
        }
    ]
    profile: {
        firstName: string;
        lastName: string;
        contact: string;
    },
    active: boolean,
    deleted: boolean;
}
