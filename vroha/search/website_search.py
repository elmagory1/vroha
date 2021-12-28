# Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and Contributors
# License: MIT. See LICENSE

import os

from bs4 import BeautifulSoup
from whoosh.fields import ID, TEXT, Schema

import frappe
from vroha.search.full_text_search import FullTextSearch
from frappe.utils import set_request, update_progress_bar
from frappe.website.serve import get_response_content
from whoosh.analysis import LanguageAnalyzer, NgramWordAnalyzer
from whoosh.lang import has_stemmer

from frappe.translate import get_translations, get_language

INDEX_NAME = "web_routes"

class WebsiteSearch(FullTextSearch):
	""" Wrapper for WebsiteSearch """

	def get_schema(self):

		if has_stemmer(get_language()):
			analyzer = LanguageAnalyzer(get_language())
		else:
			analyzer = NgramWordAnalyzer(minsize=3)

		return Schema(path=ID(stored=True), title=TEXT(analyzer=analyzer, phrase=False, stored=True, field_boost=2.0), content=TEXT(stored=True))

	def get_id(self):
		return "path"

	def get_items_to_index(self):
		"""Get all routes to be indexed, this includes the static pages
		in www/ and routes from published documents

		Returns:
			self (object): FullTextSearch Instance
		"""

		if getattr(self, "_items_to_index", False):
			return self._items_to_index

		self._items_to_index = []


		routes = get_static_pages_from_all_apps() + slugs_with_web_view(self._items_to_index)
		#print(routes)


		for i, route in enumerate(routes):
			update_progress_bar("Retrieving Routes", i, len(routes))
			main_dict = self.get_document_to_index(route)
			self._items_to_index += [main_dict]

			#if translation
			translations = get_translations(main_dict.title)
			if translations:
				for translate in translations:
					tran_dict = frappe._dict(title=translate.translation, content=main_dict.content, path=route)
					self._items_to_index += [tran_dict]

		#print(self._items_to_index)

		return self.get_items_to_index()

	def get_document_to_index(self, route):
		"""Render a page and parse it using BeautifulSoup

		Args:
			path (str): route of the page to be parsed

		Returns:
			document (_dict): A dictionary with title, path and content
		"""
		frappe.set_user("Guest")
		frappe.local.no_cache = True

		try:
			set_request(method="GET", path=route)
			content = get_response_content(route)
			soup = BeautifulSoup(content, "html.parser")
			#page_content = soup.find(class_="page_content")
			#text_content = page_content.text if page_content else ""
			#removed text_content for now as will do something beautiful with this later
			text_content = ""
			title = soup.title.text.strip() if soup.title else route
			main_dict = frappe._dict(title=title, content=text_content, path=route)

			return main_dict
		except Exception:
			pass
		finally:
			frappe.set_user("Administrator")

	def parse_result(self, result):
		title_highlights = result.highlights("title")
		content_highlights = result.highlights("content")

		return frappe._dict(
			title=result["title"],
			path=result["path"],
			title_highlights=title_highlights,
			content_highlights=content_highlights,
		)


def slugs_with_web_view(_items_to_index):
	all_routes = []
	filters = { "has_web_view": 1, "allow_guest_to_view": 1, "index_web_pages_for_search": 1}
	fields = ["name", "is_published_field", "website_search_field"]
	doctype_with_web_views = frappe.get_all("DocType", filters=filters, fields=fields)

	for doctype in doctype_with_web_views:
		if doctype.is_published_field or doctype.name == "Item":
			fields=["route", doctype.website_search_field]
			filters={doctype.is_published_field: 1} if not doctype.name=="Item" else {"show_in_website": 1}
			if doctype.website_search_field:
				docs = frappe.get_all(doctype.name, filters=filters, fields=fields + ["title"])
				for doc in docs:
					content = frappe.utils.md_to_html(getattr(doc, doctype.website_search_field))
					soup = BeautifulSoup(content, "html.parser")
					text_content = soup.text if soup else ""
					#in def get_items_to_index(self): it will not move ahead for further souping that is def get_document_to_index as return _items_to_index
					_items_to_index += [frappe._dict(title=doc.title, content=text_content, path=doc.route)]
			else:
				docs = frappe.get_all(doctype.name, filters=filters, fields=fields)
				all_routes += [route.route for route in docs]

	return all_routes

def get_static_pages_from_all_apps():
	from glob import glob
	apps = frappe.get_installed_apps()

	routes_to_index = []
	for app in apps:
		path_to_index = frappe.get_app_path(app, 'www')

		files_to_index = glob(path_to_index + '/**/*.html', recursive=True)
		files_to_index.extend(glob(path_to_index + '/**/*.md', recursive=True))
		for file in files_to_index:
			route = os.path.relpath(file, path_to_index).split('.')[0]
			if route.endswith('index'):
				route = route.rsplit('index', 1)[0]
			routes_to_index.append(route)
	return routes_to_index

def update_index_for_path(path):
	ws = WebsiteSearch(INDEX_NAME)
	return ws.update_index_by_name(path)

def remove_document_from_index(path):
	ws = WebsiteSearch(INDEX_NAME)
	return ws.remove_document_from_index(path)

def build_index_for_all_routes():
	ws = WebsiteSearch(INDEX_NAME)
	return ws.build()
