import frappe
from frappe import _
from erpnext.setup.doctype.item_group.item_group import ItemGroup, get_child_groups

from frappe.utils import cint,cstr
from roadslink.shopping_cart.filters import CustomProductFiltersBuilder
from roadslink.shopping_cart.product_query import CustomProductQuery
from frappe.desk.search import sanitize_searchfield

class CustomItemGroup(ItemGroup):
    
    def get_context(self, context):
        context.show_search=True
        context.page_length = cint(frappe.db.get_single_value('Products Settings', 'products_per_page')) or 9
        context.route = self.route
        
        if frappe.form_dict:
            search = cstr(frappe.form_dict.txt)
            sanitize_searchfield(search)
            field_filters = frappe.parse_json(frappe.form_dict.field_filters)
            attribute_filters = frappe.parse_json(frappe.form_dict.attribute_filters)
            start = cint(frappe.form_dict.start)
        else:
            search = None
            attribute_filters = None
            field_filters = None
            start = 0
        
        engine = CustomProductQuery()
        items = engine.query(attribute_filters, field_filters, search, start=start, item_group=self.name)
        context.items = items
        #context.p_count= len(context.items)        
        filter_engine = CustomProductFiltersBuilder(self.name) #self.item_group is passed in the class
        context.field_filters = filter_engine.get_field_filters()
        context.attribute_filters = filter_engine.get_attribute_filters()
        
        pro_custom = frappe.db.get_single_value('All Products Custom', 'default_group')
        item_group = frappe.get_cached_value("Item Group", pro_custom, ["lft", "rgt"], as_dict=1)
        
        context.categories =frappe.db.sql("""select website_title,route
        from `tabItem Group` where lft>%s and rgt<=%s
            and show_in_website = 1 """, (item_group.lft, item_group.rgt), as_dict=1)
        
        print(context.categories)
        
        context.update({
			"parents": get_parent_item_groups(self.parent_item_group),
			"title": self.name
		})
        
        if self.items_slideshow:
            
            values = {
				'item_slideshow': self.items_slideshow,
				'total_slides':[]
			}
            slideshow = frappe.get_doc("Item Slideshow", self.items_slideshow)
            slides = slideshow.get({"doctype":"Website Slideshow Item Items"})
            for index, slide in enumerate(slides):
                item_doc= frappe.get_doc("Item", slide.item)
                values[f"slide_{index + 1}_image"] = item_doc.website_image
                values[f"slide_{index + 1}_video"] = item_doc.item_video
                values[f"slide_{index + 1}_group"] = item_doc.item_group
                values[f"slide_{index + 1}_title"] = item_doc.item_name
                values[f"slide_{index + 1}_subtitle"] = item_doc.description
                values[f"slide_{index + 1}_primary_action_label"] = slide.label
                values[f"slide_{index + 1}_primary_action"] = item_doc.route
                values[f"slide_{index + 1}_rating"] = item_doc.rating
                values[f"slide_{index + 1}_pillcolor"] = slide.pill_color
                values[f"slide_{index + 1}_total_ratings"] = item_doc.total_ratings
                values["total_slides"].append(cstr(index+1)) #gives['1','2'...]
                #values.update({"total_slides": values.get("total_slides") + 1})
                
            context.slideshow = values
            
        context.no_breadcrumbs = 0
        #context.title = self.website_title or self.name
        
        return context
    
def get_parent_item_groups(item_group_name):
    base_parents = [
        {"name": frappe._("Home"), "route":"/all"},
    ]
    if not item_group_name:
        return base_parents

    item_group = frappe.get_doc("Item Group", item_group_name)
    parent_groups = frappe.db.sql("""select name, route from `tabItem Group`
            where lft <= %s and rgt >= %s
            and show_in_website=1
            order by lft asc""", (item_group.lft, item_group.rgt), as_dict=True)

    return base_parents + parent_groups
