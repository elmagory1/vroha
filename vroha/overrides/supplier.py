import frappe
from erpnext.buying.doctype.supplier.supplier import Supplier


class CustomSupplier(Supplier):
    def create_primary_contact(self):	
        from erpnext.selling.doctype.customer.customer import make_contact
        if not self.supplier_primary_contact:
            if self.user_id:
                user_doc = frappe.get_doc("User", self.user_id)
                self.db_set('mobile_no', user_doc.mobile_no)
                self.db_set('email_id', user_doc.email_id)

            if self.mobile_no or self.email_id: 
                contact = make_contact(self)
                self.db_set('supplier_primary_contact', contact.name)
                
                
                
    def validate(self):
        need_verify = frappe.get_single("Selling Settings").get('supplier_need_verification')
        if not need_verify:
            self.verified=1
        super(CustomSupplier, self).validate()
  