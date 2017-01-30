import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

Accounts.onCreateUser(function(options, user) {
    // Use provided userData in options, or create an empty object
    // user profile
    if (typeof options.profile !== "undefined") {
        user.profile = options.profile || {};
    }
    // user status
    if (typeof options.status !== "undefined") {
        user.status = options.status || {};
    }

    // Returns the user object
    return user;
});

// assign super-admin role on signup
// const setUserRolesOnSignUp = (userId, info) => {
//  Roles.addUsersToRoles(userId, ['super-admin']);
// };

// remove login attempt limit
// Accounts.removeDefaultRateLimit();

// validate user role before login
/*Accounts.validateLoginAttempt(function (options) {
   if (options.user && options.allowed) {
       var isAdmin = Roles.userIsInRole(options.user, ['super-admin'])
       if (!isAdmin) {
           throw new Meteor.Error(403, "Not authorized!");
       }
   }
   return true;
});*/