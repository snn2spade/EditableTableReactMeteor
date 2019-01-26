import {Meteor} from 'meteor/meteor';

Meteor.methods({
    sendVerifyAndSaveRequest(transactions) {
        console.log("Call Meteor sendVerifyAndSaveRequest");
        console.log(transactions);
        try {
            // TODO Cleanup key from transactions
            // TODO Verity and Save using External API
            return true
        }
        catch (e) {
            console.error(e);
            throw new Meteor.Error('Error on perform sendVerifyAndSaveRequest', e);
        }
    }
});