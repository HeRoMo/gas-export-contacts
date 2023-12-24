import { Contacts } from './Contacts';

function outputToSheet(contactList: string[][]) {
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.getDataRange().clear();
  const range = sheet.getRange(1, 1, contactList.length, contactList[0].length);
  range.setValues(contactList);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatContacts(contacts: GoogleAppsScript.People.Schema.Person[]) {
  const contactValues = contacts.map((person) => {
    const name = person.names[0];
    const homeAddress = person.addresses.filter((address) => address.type.toLowerCase() === 'home')[0];
    const spouse = person.relations?.filter((s) => s.type?.toLowerCase() === 'spouse')[0];
    return [
      name.familyName,
      name.givenName,
      name.phoneticFamilyName,
      name.phoneticGivenName,
      homeAddress.postalCode,
      homeAddress.region,
      homeAddress.streetAddress,
      homeAddress.extendedAddress,
      spouse?.person || '',
    ];
  });
  const header = ['姓', '名', '姓かな', '名かな', '自宅〒', '自宅住所1', '自宅住所2', '自宅住所3', '連名1'];
  contactValues.splice(0, 0, header);
  return contactValues;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function exportContacts() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const name = sheet.getName();
  const contacts = Contacts.getCoutactsByGroupName(name);
  outputToSheet(formatContacts(contacts));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onOpen(e: GoogleAppsScript.Events.SheetsOnOpen) {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('Contacts');
  menu.addItem('シート名のグループをエクスポート', 'exportContacts').addToUi();
}
