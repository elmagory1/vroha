import frappe
from frappe.contacts.doctype.address.address import Address


class CustomAddress(Address):
    
    def make_phone(self):
        if self.dial_code and self.contact_number:
            self.phone= self.dial_code.strip()+self.contact_number.strip()
                    
    def validate(self):
        self.make_phone()
        super(CustomAddress, self).validate()
        