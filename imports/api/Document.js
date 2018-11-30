import {Mongo} from 'meteor/mongo';
import {Meteor} from "meteor/meteor";

export default Document = new Mongo.Collection('document');
if (Meteor.isClient) {
    console.log("Client Subscribing document.all")
    Meteor.subscribe('document.all');
}

if (Meteor.isServer) {
    console.log("Publishing document.all")
    Meteor.publish('document.all', function () {
        console.log("Call Published data document.all")
        return Document.find({});
    });
}