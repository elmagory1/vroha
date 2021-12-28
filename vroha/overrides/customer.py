import frappe
from erpnext.selling.doctype.customer.customer import Customer,make_contact


class CustomCustomer(Customer):
    def create_primary_contact(self):	
        if not self.customer_primary_contact and not self.lead_name:
            if self.user_id:
                user_doc = frappe.get_doc("User", self.user_id)
                self.db_set('mobile_no', user_doc.mobile_no)
                self.db_set('email_id', user_doc.email_id)

            if self.mobile_no or self.email_id: 
                contact = make_contact(self)
                self.db_set('customer_primary_contact', contact.name)
        #else: #implemeted same functioality in on_update at contact.py
            #contact_doc = frappe.get_doc("Contact", self.customer_primary_contact)
            #self.db_set('mobile_no', contact_doc.mobile_no)
            #self.db_set('email_id', contact_doc.email_id)
            