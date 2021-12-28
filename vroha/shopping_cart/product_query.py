# Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

import frappe

from erpnext.shopping_cart.product_info import get_product_info_for_website
from erpnext.shopping_cart.product_query import ProductQuery


class CustomProductQuery(ProductQuery):
    """Query engine for product listing

	Attributes:
	    cart_settings (Document): Settings for Cart
	    fields (list): Fields to fetch in query
	    filters (TYPE): Description
	    or_filters (list): Description
	    page_length (Int): Length of page for the query
	    settings (Document): Products Settings DocType
	    filters (list)
	    or_filters (list)
	"""

    
    def __init__(self):
        self.settings = frappe.get_doc("Products Settings")
        self.cart_settings = frappe.get_doc("Shopping Cart Settings")
        self.page_length = self.settings.products_per_page or 20
        self.fields = ['name', 'category_color', 'item_name', 'item_code', 'website_image', 'variant_of', 'has_variants',
			'item_group', 'image', 'web_long_description', 'description', 'route', 'weightage']
        self.filters = []
        self.or_filters = [['show_in_website', '=', 1]]
        if not self.settings.get('hide_variants'):
            self.or_filters.append(['show_variant_in_website', '=', 1])
            
    def get_child_groups(self, item_group_name):
        item_group_doc = frappe.get_doc("Item Group", item_group_name)  
        child_groups = frappe.get_all("Item Group", fields=["name"], filters={'lft': ('>=', item_group_doc.lft),'rgt': ('<=', item_group_doc.rgt)}, pluck="name")
        return child_groups
        #child_groups.append(item_group)
            
    
    def query(self, attributes=None, fields=None, search_term=None, start=0, item_group=None):
        """Summary

		Args:
		    attributes (dict, optional): Item Attribute filters
		    fields (dict, optional): Field level filters
		    search_term (str, optional): Search term to lookup
		    start (int, optional): Page start

		Returns:
		    list: List of results with set fields
		"""
  
        if item_group is None:
            item_group = frappe.db.get_single_value("All Products Custom","default_group")
                    
            
        if fields: 
            if fields.get("item_group"):
                self.build_fields_filters(fields)
            else:
                fields.update({
					'item_group': self.get_child_groups(item_group)
				})
                self.build_fields_filters(fields)
        else:
            fields= frappe._dict({
					'item_group': self.get_child_groups(item_group)
				})
            self.build_fields_filters(fields)
            
                
        if search_term: self.build_search_filters(search_term)
        
        result = []
                
        self.or_filters.append(["Website Item Group", "item_group", "=", item_group])
        
        if attributes:
            all_items = []
            for attribute, values in attributes.items():
                if not isinstance(values, list):
                    values = [values]
                
                items = frappe.get_all(
					"Item",
					fields=self.fields,
					filters=[
						*self.filters,
						["Item Variant Attribute", "attribute", "=", attribute],
						["Item Variant Attribute", "attribute_value", "in", values],
					],
					or_filters=self.or_filters,
					distinct="True",
					start=start,
					limit=self.page_length,
					order_by="weightage desc"
				)
                
                items_dict = {item.name: item for item in items}
                all_items.append(set(items_dict.keys()))
            result = [items_dict.get(item) for item in list(set.intersection(*all_items))]
        else:
            result = frappe.get_all(
				"Item",
				fields=self.fields,
				filters=self.filters,
				or_filters=self.or_filters,
				distinct="True",
				start=start,
				limit=self.page_length,
				order_by="weightage desc"
			)
        	#result = sorted(result, key=lambda x: x.get("weightage"), reverse=True)

        
        for item in result:
            product_info = get_product_info_for_website(item.item_code, skip_quotation_creation=True).get('product_info')
            if product_info:
                item.formatted_price = (product_info.get('price') or {}).get('formatted_price')
                
        return result
    
    def build_fields_filters(self, filters):
        """Build filters for field values

		Args:
		    filters (dict): Filters
		"""
        for field, values in filters.items():
            if not values:
                continue
            
            # handle multiselect fields in filter addition

            meta = frappe.get_meta('Item', cached=True)
            df = meta.get_field(field)
            if df.fieldtype == 'Table MultiSelect':
                child_doctype = df.options
                child_meta = frappe.get_meta(child_doctype, cached=True)
                fields = child_meta.get("fields")
                if fields:
                    self.filters.append([child_doctype, fields[0].fieldname, 'IN', values])
                elif isinstance(values, list):
                    # If value is a list use `IN` query
                    self.filters.append([field, 'IN', values])
            else:
                if isinstance(values, list):
                    self.filters.append([field, 'IN', values])
                else:
                    self.filters.append([field, '=', values])                
        
    def build_search_filters(self, search_term):
        """Query search term in specified fields

		Args:
		    search_term (str): Search candidate
		"""
        
        default_fields = {'item_name'}
        search_fields = default_fields
        try:
            if frappe.db.count('Item', cache=True) > 50000:
                search_fields.remove('description')
        except KeyError:
            pass
        
        search = '%{}%'.format(search_term)
        self.filters += [[field, 'like', search] for field in search_fields]
