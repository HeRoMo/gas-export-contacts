export class Contacts {
  private static fetchContactGroup(name: string, pageToken: string):
    { group: GoogleAppsScript.People.Schema.ContactGroup, nextPageToken: string } {
    try {
      const { contactGroups, nextPageToken } = People.ContactGroups.list({ groupFields: 'name', pageToken });
      let res: GoogleAppsScript.People.Schema.ContactGroup;
      for (const group of contactGroups) { // eslint-disable-line no-restricted-syntax
        if (group.formattedName === name) {
          res = group;
          break;
        }
      }
      return { group: res, nextPageToken };
    } catch (error) {
      console.info({ error });
      throw error;
    }
  }

  private static fetchContacts(groupId: string, pageToken: string):
    { contacts: GoogleAppsScript.People.Schema.Person[], nextPageToken: string } {
    try {
      const { connections, nextPageToken } = People.People.Connections.list('people/me', { personFields: 'names,addresses,memberships,relations', pageToken });
      const contacts = connections.filter((person) => {
        const isGroupMember = person.memberships.find(
          (ms) => ms.contactGroupMembership?.contactGroupId === groupId,
        );
        delete person.memberships; // eslint-disable-line no-param-reassign
        return isGroupMember;
      });
      return { contacts, nextPageToken };
    } catch (error) {
      console.info({ error });
      throw error;
    }
  }

  public static getGroupByName(name: string): GoogleAppsScript.People.Schema.ContactGroup {
    let pageToken: string = null;
    let res :GoogleAppsScript.People.Schema.ContactGroup;
    try {
      do {
        const { group, nextPageToken } = Contacts.fetchContactGroup(name, pageToken);
        if (group) {
          res = group;
        }
        pageToken = nextPageToken;
      } while (pageToken);
      return res;
    } catch (error) {
      console.info({ error });
      throw error;
    }
  }

  public static getCoutactsByGroupName(groupName: string): GoogleAppsScript.People.Schema.Person[] {
    const group = Contacts.getGroupByName(groupName);
    if (!group) {
      return [];
    }
    const groupId = group.resourceName.split('/')[1];
    let pageToken: string = null;
    let contactList: GoogleAppsScript.People.Schema.Person[] = [];
    try {
      do {
        const { contacts, nextPageToken } = Contacts.fetchContacts(groupId, pageToken);
        contactList = contactList.concat(contacts);
        pageToken = nextPageToken;
      } while (pageToken);
      return contactList;
    } catch (error) {
      console.error({ error });
      throw error;
    }
  }
}
