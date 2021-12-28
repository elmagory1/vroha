import frappe
from frappe import _
from frappe.utils import cint, flt
from frappe.website.doctype.web_page.web_page import WebPage,get_web_blocks_html


class CustomWebPage(WebPage):
    def get_context(self, context):
        super(CustomWebPage, self).get_context(context)
        context.update({
			"page_div_class":self.page_div_class
		})
        return context
    
    def set_page_blocks(self, context):
        if self.content_type != 'Page Builder':
            return
        
        from frappe.translate import get_language
        if self.language != get_language():
            try:
                doc_fetch = frappe.get_doc("Web Page Version", self.name+'-'+get_language())
                page_blocks = doc_fetch.page_blocks
            except Exception:
                page_blocks = self.page_blocks
        else:
            page_blocks = self.page_blocks
            
        out = get_web_blocks_html(page_blocks)
        context.page_builder_html = out.html
        context.page_builder_scripts = out.scripts
        context.page_builder_styles = out.styles


		