import frappe
from frappe import _, get_single
import frappe.sessions
from frappe.utils import getdate
from frappe.utils.jinja_globals import is_rtl
#from frappe import local



def website_context(context):
    if frappe.request:
        if frappe.request.path == "/" and frappe.session.user != "Guest":
            frappe.local.flags.redirect_location = "/home"
            raise frappe.Redirect
    
    selling_settings = frappe.get_single("Selling Settings")
    user_roles=frappe.get_doc('User', frappe.session.user , fields=["roles"])
    
    context.update({
       # "supplier_need_verification":selling_settings.supplier_need_verification,
        "do_elearn": selling_settings.learning_enabled
    })
        
    if "supplier" in user_roles.roles:
        verified_sup = 0
        #if selling_settings.supplier_need_verification:
        verified_sup = frappe.get_value("Supplier", {"user": frappe.session.user },"verified")
        context.update({
            "is_supplier":1,
            "is_verified_sup": verified_sup,
        })
                
    context.update({
        "color_theme": frappe.db.get_single_value("Website Settings", "color_theme"),
        "logged_lang":frappe.sessions.get().lang,
        #"loaded_lang":local.lang,
        "layout_direction": "rtl" if is_rtl() else "ltr",
        "main_catr":frappe.db.get_single_value("All Products Custom","default_group"),
        "countdown": getdate(frappe.get_single("Countdown Settings").countdown or '19-09-2021').strftime('%Y/%m/%d'),
		"post_login": [
			{"label": _("Account"), "url": "/me"},
			{"label": _("Logout"), "url": "/?cmd=web_logout"}
		]
	})