import frappe

from frappe.utils import cstr

sitemap = 1


def get_context(context):
    
    # Add homepage as parent
    context.parents = [{"name": frappe._("Home"), "route":"/"}]
    
    pro_custom = frappe.get_single('All Products Custom')
    
    item_group = frappe.get_cached_value("Item Group", pro_custom.default_group, ["lft", "rgt"], as_dict=1)
    
    
    context.categories =frappe.db.sql("""select name,website_title,route,category_color,category_icon
        from `tabItem Group` where lft>%s and rgt<=%s
            and show_in_website = 1 order by weightage desc limit 10 """, (item_group.lft, item_group.rgt), as_dict=1)
    
    context.popular =frappe.db.sql("""select item_name,item_code,item_group,category_color,route,website_image,rating
        from `tabItem` where show_in_website = 1 and disabled != 1 order by rating desc limit 10 """, as_dict=1)
    
    from erpnext.shopping_cart.product_info import get_product_info_for_website
    
    for item in context.popular:
        #item.update(get_product_info_for_website(item.item_code, skip_quotation_creation=True).product_info)
        product_info = get_product_info_for_website(item.item_code, skip_quotation_creation=True).get('product_info')
        if product_info:
            item.formatted_price = (product_info.get('price') or {}).get('formatted_price')
        
    slideshow_doc = pro_custom.slideshow
    
    if slideshow_doc:
        values = {
				'item_slideshow': slideshow_doc,
				'total_slides':[]
		}
        slideshow = frappe.get_doc("Item Slideshow", slideshow_doc)
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
    
    context.no_cache = 1
