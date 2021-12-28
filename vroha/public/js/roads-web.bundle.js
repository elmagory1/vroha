import "frappe/public/js/jquery-bootstrap";
// all the bootstrap jquery bundle

import "frappe/public/js/frappe/class.js";
import "frappe/public/js/frappe/polyfill.js";
import "frappe/public/js/lib/md5.min.js";
import "frappe/public/js/frappe/provide.js";
import "frappe/public/js/frappe/format.js";
import "frappe/public/js/frappe/utils/number_format.js";
import "frappe/public/js/frappe/utils/utils.js";
import "./frappe/utils/common.js";
import "./frappe/ui/messages.js";
import "frappe/public/js/frappe/translate.js";
import "frappe/public/js/frappe/utils/pretty_date.js";
import "frappe/public/js/frappe/microtemplate.js";
import "frappe/public/js/frappe/query_string.js";

import "frappe/public/js/frappe/upload.js";

import "frappe/public/js/frappe/model/meta.js";
import "frappe/public/js/frappe/model/model.js";
import "frappe/public/js/frappe/model/perm.js";

import "./bootstrap-4-web.bundle"; 
// copy to roads as it contains designs for dialog annd dropdown and modal and has nothing to do with bootstrap bundle js
// dont get confuse with the name as main bootstrap bundle is jquery-bootstrap which is at the top attached already.


import "./roadslink.js";
// copy to roads as it serves basic main.js for website hence i need to customize it.

import "frappe/public/js/frappe/socketio_client.js";

import "./website_utils";
import "./shopping_cart";
// contains basic js functions for shopping cart and some website utils like send message and subscribe. so i copied it roads, might need to customize



