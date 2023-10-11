import { inject } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { WebAPI } from "./web-api";
import { areEqual } from "./utility";
import { ContactUpdated, ContactViewed } from "messages";

interface Contact {
  firstName: string;
  lastName: string;
  email: string;
}

@inject(WebAPI, EventAggregator)
export class ContactDetail {
  routeConfig;
  contact: Contact;
  originalContact: Contact;

  constructor(private api: WebAPI, private ea: EventAggregator) {}

  //life-cycle method
  activate(params, routeConfig) {
    this.routeConfig = routeConfig;

    return this.api.getContactDetails(params.id).then((contact) => {
      this.contact = <Contact>contact;
      this.routeConfig.navModel.setTitle(this.contact.firstName);
      this.originalContact = JSON.parse(JSON.stringify(this.contact));
      this.ea.publish(new ContactViewed(this.contact));
    });
  }

  get canSave() {
    return (
      this.contact.firstName && this.contact.lastName && !this.api.isRequesting
    );
  }

  save() {
    this.api.saveContact(this.contact).then((contact) => {
      this.contact = <Contact>contact;
      this.routeConfig.navModel.setTitle(this.contact.firstName);
      this.originalContact = JSON.parse(JSON.stringify(this.contact));
      this.ea.publish(new ContactUpdated(this.contact));
    });
  }

  //hook into the router's canDeactivate method to check if there are unsaved changes
  canDeactivate() {
    if (!areEqual(this.originalContact, this.contact)) {
      return confirm(
        "You have unsaved changes. Are you sure you wish to leave?"
      );
    }

    return true;
  }
}
