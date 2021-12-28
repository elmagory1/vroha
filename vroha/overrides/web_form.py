import frappe
import frappe.www.list
from frappe import _
from frappe.website.doctype.web_form.web_form import WebForm,make_route_string
from frappe.core.doctype.file.file import get_max_file_size
from frappe.website.utils import get_portal_sidebar_items

class CustomWebForm(WebForm):
    
    def get_context(self, context):
        self.set_web_form_module()
        doc, delimeter = make_route_string(frappe.form_dict)
        context.doc = doc
        context.delimeter = delimeter
        
        if frappe.session.user == "Guest" and frappe.form_dict.name:
            frappe.throw(_("You need to be logged in to access this {0}.").format(self.doc_type), frappe.PermissionError)
        
        if frappe.form_dict.name and not self.has_web_form_permission(self.doc_type, frappe.form_dict.name):
            frappe.throw(_("You don't have the permissions to access this document"), frappe.PermissionError)
            
        if frappe.form_dict.new and self.apply_document_permissions and not frappe.has_permission(self.doc_type, 'create', user=frappe.session.user):
            frappe.throw(_("You don't have the permissions to access this document"), frappe.PermissionError)
        
        self.reset_field_parent()
        
        if self.is_standard:
            self.use_meta_fields()
            
        if not frappe.session.user == "Guest":
            if self.allow_edit:
                if self.allow_multiple:
                    if not frappe.form_dict.name and not frappe.form_dict.new:
                        context.is_list = True
                else:
                    if frappe.session.user != 'Guest' and not frappe.form_dict.name:
                        frappe.form_dict.name = frappe.db.get_value(self.doc_type, {"owner": frappe.session.user}, "name")
                    
                    if not frappe.form_dict.name:
                        frappe.form_dict.new = 1
                        
        if frappe.form_dict.is_list:
            context.is_list = True
            
        if not self.login_required or not self.allow_edit:
            frappe.form_dict.new = 1
        
        self.load_document(context)
        context.parents = self.get_parents(context)
        
        if self.breadcrumbs:
            context.parents = frappe.safe_eval(self.breadcrumbs, { "_": _ })
            
        context.has_header = ((frappe.form_dict.name or frappe.form_dict.new)
            and (frappe.session.user!="Guest" or not self.login_required))
        
        if context.success_message:
            context.success_message = frappe.db.escape(context.success_message.replace("\n",
				"<br>")).strip("'")
            
        self.add_custom_context_and_script(context)
        if not context.max_attachment_size:
            context.max_attachment_size = get_max_file_size() / 1024 / 1024
            
        context.show_in_grid = self.show_in_grid

        context.sidebar_items_main = get_portal_sidebar_items()
        self.load_translations(context)
        