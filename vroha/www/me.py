# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

import frappe
from frappe import _
import frappe.www.list

no_cache = 1

def get_context(context):
	if frappe.session.user=='Guest':
		frappe.throw(_("You need to be logged in to access this page"), frappe.PermissionError)

	context.show_sidebar=True
	d = frappe.get_doc('User', frappe.session.user , fields=["full_name","mobile_no","roles"])
	context.full_name=d.full_name
	context.mobile_no=d.mobile_no
	if "supplier" in d.roles:
		context.is_supplier = 1
		
	