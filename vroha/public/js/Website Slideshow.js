/*
frappe.ui.form.on('Website Slideshow Item', {
   
    document:(frm,cdt,cdn) => {
        var child = locals[cdt][cdn];
        frappe.db.get_doc("Item", child.document).then(( item_fetch ) => {
            if(child.type == "Item"){
                frappe.model.set_value(cdt, cdn, 'image', item_fetch.website_image);
                frappe.model.set_value(cdt, cdn, 'description', item_fetch.description);
                frappe.model.set_value(cdt, cdn, 'heading', item_fetch.item_name);
                frappe.model.set_value(cdt, cdn, 'video', item_fetch.item_video);
                frappe.model.set_value(cdt, cdn, 'url', item_fetch.route);
                frappe.model.set_value(cdt, cdn, 'item_group', item_fetch.item_group);
                frappe.model.set_value(cdt, cdn, 'ratings', item_fetch.rating);
                frappe.model.set_value(cdt, cdn, 'total_ratings', item_fetch.total_ratings);
                
            }else{
                if(child.type == "Brand"){
                    frappe.model.set_value(cdt, cdn, 'image', item_fetch.website_image);
                    //frappe.model.set_value(cdt, cdn, 'url', item_fetch.route);
                }

            }
        });
        
    }

});
*/