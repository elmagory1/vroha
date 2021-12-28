import 'frappe/public/js/frappe/form/controls/base_control.js';
import './base_input';
import 'frappe/public/js/frappe/form/controls/data.js';
import 'frappe/public/js/frappe/form/controls/int.js';
import 'frappe/public/js/frappe/form/controls/float.js';
import 'frappe/public/js/frappe/form/controls/currency.js';
import 'frappe/public/js/frappe/form/controls/date.js';
import 'frappe/public/js/frappe/form/controls/time.js';
import 'frappe/public/js/frappe/form/controls/datetime.js';
import 'frappe/public/js/frappe/form/controls/date_range.js';
import 'frappe/public/js/frappe/form/controls/select.js';
import 'frappe/public/js/frappe/form/controls/link.js';
import 'frappe/public/js/frappe/form/controls/dynamic_link.js';
import 'frappe/public/js/frappe/form/controls/text.js';
import 'frappe/public/js/frappe/form/controls/code.js';
import 'frappe/public/js/frappe/form/controls/text_editor.js';
import 'frappe/public/js/frappe/form/controls/comment.js';
import 'frappe/public/js/frappe/form/controls/check.js';
import 'frappe/public/js/frappe/form/controls/image.js';
import './attach';
import 'frappe/public/js/frappe/form/controls/attach_image.js';
import 'frappe/public/js/frappe/form/controls/table.js';
import 'frappe/public/js/frappe/form/controls/color.js';
import 'frappe/public/js/frappe/form/controls/signature.js';
import 'frappe/public/js/frappe/form/controls/password.js';
import 'frappe/public/js/frappe/form/controls/read_only.js';
import 'frappe/public/js/frappe/form/controls/button.js';
import 'frappe/public/js/frappe/form/controls/html.js';
import 'frappe/public/js/frappe/form/controls/markdown_editor.js';
import 'frappe/public/js/frappe/form/controls/html_editor.js';
import 'frappe/public/js/frappe/form/controls/heading.js';
import 'frappe/public/js/frappe/form/controls/autocomplete.js';
import 'frappe/public/js/frappe/form/controls/barcode.js';
import 'frappe/public/js/frappe/form/controls/geolocation.js';
import 'frappe/public/js/frappe/form/controls/multiselect.js';
import 'frappe/public/js/frappe/form/controls/multicheck.js';
import 'frappe/public/js/frappe/form/controls/table_multiselect.js';
import 'frappe/public/js/frappe/form/controls/multiselect_pills.js';
import 'frappe/public/js/frappe/form/controls/multiselect_list.js';
import 'frappe/public/js/frappe/form/controls/rating.js';
import 'frappe/public/js/frappe/form/controls/duration.js';
import 'frappe/public/js/frappe/form/controls/icon.js';

frappe.ui.form.make_control = function (opts) {
	var control_class_name = "Control" + opts.df.fieldtype.replace(/ /g, "");
	if(frappe.ui.form[control_class_name]) {
		return new frappe.ui.form[control_class_name](opts);
	} else {
		// eslint-disable-next-line
		console.log("Invalid Control Name: " + opts.df.fieldtype);
	}
};

