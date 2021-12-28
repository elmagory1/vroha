// Copyright (c) 2021, invilab and contributors
// For license information, please see license.txt

frappe.ui.form.on('Web Page Version', {
	web_page: function(frm) {
		frm.trigger('refresh_again');

	},
	refresh_but: function(frm) {
		frm.trigger('refresh_again');

	},

	refresh_again: function(frm) {
		frappe.model.with_doc("Web Page", frm.doc.web_page, function(r) {
			var fetch_doc = frappe.model.get_doc("Web Page", frm.doc.web_page);
			frm.clear_table("page_blocks");
			$.each(fetch_doc.page_blocks, function(i, d) {
				i = frm.add_child("page_blocks");
				i.web_template = d.web_template;
				i.web_template_values = d.web_template_values;
				i.css_class = d.css_class;
				i.row_class = d.row_class;
				i.div_class = d.div_class;
				i.add_section = d.add_section;
				i.add_container = d.add_container;
				i.add_row = d.add_row;
				i.add_div = d.add_div;
				i.add_top_padding = d.add_top_padding;
				i.add_bottom_padding = d.add_bottom_padding;
				i.add_shade = d.add_shade;
				i.hide_block = d.hide_block;
				i.row_div_con_sec_end = d.row_div_con_sec_end;
			});
			frm.refresh_field("page_blocks");
		})
	}
});

frappe.ui.form.on("Web Page Block", {
	edit_values(frm, cdt, cdn) {
		let row = frm.selected_doc;
		let values = JSON.parse(row.web_template_values || "{}");
		open_web_template_values_editor(row.web_template, values)
			.then(new_values => {
				frappe.model.set_value(cdt, cdn, "web_template_values", JSON.stringify(new_values));
			});
	},
});


