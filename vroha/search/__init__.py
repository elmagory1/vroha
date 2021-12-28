# Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and Contributors
# License: MIT. See LICENSE

import frappe
import re
from frappe import _
from frappe.utils import cint
from vroha.search.website_search import WebsiteSearch
from vroha.search.full_text_search import FullTextSearch

@frappe.whitelist(allow_guest=True)
def web_search(query, scope=None, limit=20):
	limit = cint(limit)
	sanitize_searchfield(query)
	ws = WebsiteSearch(index_name="web_routes")
	return ws.search(query, scope, limit)

def sanitize_searchfield(searchfield):
	blacklisted_keywords = ['select', 'delete', 'drop', 'update', 'case', 'and', 'or', 'like']

	def _raise_exception(searchfield):
		frappe.throw(_('Invalid Search Field {0}').format(searchfield), frappe.DataError)

	if len(searchfield) == 1:
		# do not allow special characters to pass as searchfields
		regex = re.compile(r'^.*[=;,\'"$\-+%#@()_].*')
		if regex.match(searchfield):
			_raise_exception(searchfield)

	if len(searchfield) >= 2:

		# to avoid 1=1
		if '=' in searchfield:
			_raise_exception(searchfield)

		# in mysql -- is used for commenting the query
		elif ' --' in searchfield:
			_raise_exception(searchfield)

		# to avoid and, or and like
		elif any(' {0} '.format(keyword) in searchfield.split() for keyword in blacklisted_keywords):
			_raise_exception(searchfield)

		# to avoid select, delete, drop, update and case
		elif any(keyword in searchfield.split() for keyword in blacklisted_keywords):
			_raise_exception(searchfield)

		else:
			regex = re.compile(r'^.*[=;,\'"$\-+%#@()].*')
			if any(regex.match(f) for f in searchfield.split()):
				_raise_exception(searchfield)
