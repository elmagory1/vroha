import frappe
from frappe import _

from frappe.custom.doctype.customize_form.customize_form import CustomizeForm
from frappe.utils import cint
from frappe.model import no_value_fields
from frappe.model.docfield import supports_translation

class CustomCustomizeForm(CustomizeForm):
    
    def allow_property_change(self, prop, meta_df, df):
        if prop == "fieldtype":
            self.validate_fieldtype_change(df, meta_df[0].get(prop), df.get(prop))
            
        elif prop == "length":
            old_value_length = cint(meta_df[0].get(prop))
            new_value_length = cint(df.get(prop))
            
            if new_value_length and (old_value_length > new_value_length):
                self.check_length_for_fieldtypes.append({'df': df, 'old_value': meta_df[0].get(prop)})
                self.validate_fieldtype_length()
            else:
                self.flags.update_db = True
        elif prop == "allow_on_submit" and df.get(prop):
            if not frappe.db.get_value("DocField",
				{"parent": self.doc_type, "fieldname": df.fieldname}, "allow_on_submit"):
                frappe.msgprint(_("Row {0}: Not allowed to enable Allow on Submit for standard fields")\
					.format(df.idx))
                return False
        
        elif prop == "in_list_view" and df.get(prop) \
            and df.fieldtype!="Attach Image" and df.fieldtype in no_value_fields:
            frappe.msgprint(_("'In List View' not allowed for type {0} in row {1}")
						.format(df.fieldtype, df.idx))
            return False
        
        elif prop == "precision" and cint(df.get("precision")) > 6 \
				and cint(df.get("precision")) > cint(meta_df[0].get("precision")):
            self.flags.update_db = True
            
        elif prop == "unique":
            self.flags.update_db = True
            
        elif (prop == "read_only" and cint(df.get("read_only"))==0
				and frappe.db.get_value("DocField", {"parent": self.doc_type,
				"fieldname": df.fieldname}, "read_only")==1):
            frappe.msgprint(_("You cannot unset 'Read Only' for field {0}").format(df.label))
            return False
        
        elif prop == "options" and df.get("fieldtype") not in ALLOWED_OPTIONS_CHANGE:
            frappe.msgprint(_("You can't set 'Options' for field {0}").format(df.label))
            return False
        
        elif prop == 'translatable' and not supports_translation(df.get('fieldtype')):
            frappe.msgprint(_("You can't set 'Translatable' for field {0}").format(df.label))
            return False
        
        elif (prop == 'in_global_search' and
			df.in_global_search != meta_df[0].get("in_global_search")):
            self.flags.rebuild_doctype_for_global_search = True
        
        return True

    def validate_doctype(self, meta):
        core_doctypes_list = ('DocType','DocField','DocPerm','DocType Action','DocType Link','Role','Has Role','Page','Module Def','Print Format','Report','Customize Form','Customize Form Field','Property Setter','Custom Field','Client Script')

        '''
        Check if the doctype is allowed to be customized.
        '''
        if self.doc_type in core_doctypes_list:
            frappe.throw(_("Core DocTypes cannot be customized."))

        #if meta.issingle:
            #frappe.throw(_("Single DocTypes cannot be customized."))

        if meta.custom:
            frappe.throw(_("Only standard DocTypes are allowed to be customized from Customize Form."))
            
ALLOWED_OPTIONS_CHANGE = ('Read Only', 'HTML', 'Select', 'Data')