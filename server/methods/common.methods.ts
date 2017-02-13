import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
    "fetchStats": () => {
        let activePackages = Meteor.call("packages.count", { "$or": [{ active: true }, { active: { $exists: false } }] });
        let inactivePackages = Meteor.call("packages.count", { active: true });
        let activeUsers = Meteor.call("users.count", { $and:
            [
                { "$or": [{ active: true }, { active: { $exists: false } }] },
                { "roles": "practitioner" }
            ],
            
        });
        let inactiveUsers = Meteor.call("users.count", { active: false, "roles": "practitioner" });
        
        return {
            "packages": {
                "active": activePackages,
                "inactive": inactivePackages
            },
            "users": {
                "active": activeUsers,
                "inactive": inactiveUsers
            }
        };
    }
})