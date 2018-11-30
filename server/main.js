import {Meteor} from 'meteor/meteor';
import Document from '/imports/api/Document.js'

Meteor.startup(() => {
    if (Document.find().count() === 0) {
        Document.insert({transactions: [{date: "2018-01-01", debit: "", credit: "100", balance: "1000"}]});
    }
});

Meteor.methods({
    sendVerifyAndSaveRequest(document_obj_id, transactions) {
        console.log("Call Meteor sendVerifyAndSaveRequest: " + document_obj_id)
        console.log(transactions)
        try {
            // TODO Call remote update document via External API
            Document.update(document_obj_id, {$set: {transactions: transactions}})
            return true
        }
        catch (e) {
            console.error(e)
            throw new Meteor.Error('Error on perform sendVerifyAndSaveRequest', e);
        }
    }
});