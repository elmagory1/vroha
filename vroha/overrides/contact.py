import frappe
from frappe.contacts.doctype.contact.contact import Contact


class CustomContact(Contact):
    
    def add_phone(self, dial_country, phone, is_primary_phone=0, is_primary_mobile_no=0, autosave=False):
        dial_code = frappe.get_value("Country",dial_country, "dial_code")
        req_phone= dial_code.strip()+phone.strip()
        if not frappe.db.exists("Contact Phone", {"phone": phone, "parent": self.name}):
            self.append("phone_nos", {
                "dial_country": dial_country,
                "dial_code":dial_code,
                "mobile_number":phone,
				"phone": req_phone,
				"is_primary_phone": is_primary_phone,
				"is_primary_mobile_no": is_primary_mobile_no
			})
            if autosave:
                self.save(ignore_permissions=True)
    
    def make_phone(self):
        for d in self.get("phone_nos"):
            if d.dial_code and d.mobile_number:
                d.phone= d.dial_code.strip()+d.mobile_number.strip()
                    
    def validate(self):
        self.make_phone()
        #if self.user:
            #roles = frappe.get_roles(self.user)
        #if self.is_new:
            #if 'Customer' in roles:
        super(CustomContact, self).validate()
        
    def on_update(self):
        if self.is_primary_contact:
            for d in self.get("links"):
                if d.link_doctype == "Customer":
                    frappe.db.set_value(d.link_doctype, d.link_name, {
                        'customer_primary_contact': self.name,
                        'email_id': self.email_id,
                        'mobile_no' : self.phone
                    })
                elif d.link_doctype == "Supplier":
                    frappe.db.set_value(d.link_doctype, d.link_name, {
                        'supplier_primary_contact': self.name,
                        'email_id': self.email_id,
                        'mobile_no' : self.phone
                    })
        
   