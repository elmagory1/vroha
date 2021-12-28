(() => {
  // ../vroha/vroha/public/js/frappe/ui/toolbar/about.js
  frappe.provide("frappe.ui.misc");
  frappe.ui.misc.about = function() {
    if (!frappe.ui.misc.about_dialog) {
      var d;
      frappe.db.get_doc("Website social links").then((doc) => {
        d = new frappe.ui.Dialog({title: __(doc.welcome_text)});
        var fragment = doc.social_links.map((r) => {
          if (r.show_desk == 1) {
            return `<p><i class='fa ${r.font_desk} fa-fw'></i>
						<b>${__(r.title)}:</b> <a href='${r.url}'>${__(r.label)}</a>
						</p>`;
          }
        }).join("");
        $(d.body).html(fragment);
        frappe.ui.misc.about_dialog = d;
        frappe.ui.misc.about_dialog.show();
      });
    }
  };

  // frappe-html:/Users/bagback/stuffs/projects/sunil/sunil/apps/vroha/vroha/public/js/frappe/ui/toolbar/navbar.html
  frappe.templates["navbar"] = `<header class="navbar navbar-expand sticky-top" role="navigation">
	<div class="container">
		<a class="navbar-brand navbar-home" href="/app">
			<img class="app-logo" style="width: {{ navbar_settings.logo_width || 24 }}px" src="{{ frappe.boot.app_logo_url }}">
		</a>
		<ul class="nav navbar-nav d-none d-sm-flex" id="navbar-breadcrumbs"></ul>
		<div class="collapse navbar-collapse justify-content-end">
			<form class="form-inline fill-width justify-content-end" role="search" onsubmit="return false;">
				<div class="input-group search-bar text-muted hidden">
					<input
						id="navbar-search"
						type="text"
						class="form-control"
						placeholder="{%= __("Search or type a command (Ctrl + G)") %}"
						aria-haspopup="true"
					>
					<span class="search-icon">
						<svg class="icon icon-sm"><use xlink:href="#icon-search"></use></svg>
					</span>
				</div>
			</form>
			<ul class="navbar-nav">
				<li class="nav-item dropdown dropdown-notifications dropdown-mobile hidden">
					<a
						class="nav-link notifications-icon text-muted"
						data-toggle="dropdown"
						aria-haspopup="true"
						aria-expanded="true"
						href="#"
						onclick="return false;">
						<span class="notifications-seen">
							<svg class="icon icon-md"><use href="#icon-notification"></use></svg>
						</span>
						<span class="notifications-unseen">
							<svg class="icon icon-md"><use href="#icon-notification-with-indicator"></use></svg>
						</span>
					</a>
					<div class="dropdown-menu notifications-list dropdown-menu-right" role="menu">
						<div class="notification-list-header">
							<div class="header-items"></div>
							<div class="header-actions"></div>
						</div>
						<div class="notification-list-body">
							<div class="panel-notifications"></div>
							<div class="panel-events"></div>
						</div>
					</div>
				</li>
				<li class="nav-item dropdown dropdown-message dropdown-mobile hidden">
					<a
						class="nav-link notifications-icon text-muted"
						data-toggle="dropdown"
						aria-haspopup="true"
						aria-expanded="true"
						href="#"
						onclick="return false;">
						<span>
							<svg class="icon icon-md"><use href="#icon-small-message"></use></svg>
						</span>
					</a>
				</li>
				<li class="vertical-bar d-none d-sm-block"></li>
				<li class="nav-item dropdown dropdown-help dropdown-mobile d-none d-lg-block">
					<a class="nav-link" data-toggle="dropdown" href="#" onclick="return false;">
						{{ __("Help") }}
						<span>
							<svg class="icon icon-xs"><use href="#icon-small-down"></use></svg>
						</span>
					</a>
					<div class="dropdown-menu dropdown-menu-right" id="toolbar-help" role="menu">
						{% for item in navbar_settings.help_dropdown %}
							{% if (!item.hidden) { %}
								{% if (item.route) { %}
									<a class="dropdown-item" href="{{ item.route }}">
										{%= __(item.item_label) %}
									</a>
								{% } else if (item.action) { %}
									<a class="dropdown-item" onclick="return {{ item.action }}">
										{%= __(item.item_label) %}
									</a>
								{% } else { %}
									<div class="dropdown-divider"></div>
								{% } %}
							{% } %}
						{% endfor %}
					</div>
				</li>
				<li class="nav-item dropdown dropdown-navbar-user dropdown-mobile">
					<a class="nav-link" data-toggle="dropdown" href="#" onclick="return false;">
						{{ avatar }}
					</a>
					<div class="dropdown-menu dropdown-menu-right" id="toolbar-user" role="menu">
						{% for item in navbar_settings.settings_dropdown %}
							{% if (!item.hidden) { %}
								{% if (item.route) { %}
									<a class="dropdown-item" href="{{ item.route }}">
										{%= __(item.item_label) %}
									</a>
								{% } else if (item.action) { %}
									<a class="dropdown-item" onclick="return {{ item.action }}">
										{%= __(item.item_label) %}
									</a>
								{% } else { %}
									<div class="dropdown-divider"></div>
								{% } %}
							{% } %}
						{% endfor %}
					</div>
				</li>
			</ul>
		</div>
	</div>
</header>
`;

  // ../vroha/vroha/public/js/frappe/ui/toolbar/toolbar.js
  frappe.provide("frappe.ui.toolbar");
  frappe.provide("frappe.search");
  frappe.ui.toolbar.Toolbar = class {
    constructor() {
      $("header").replaceWith(frappe.render_template("navbar", {
        avatar: frappe.avatar(frappe.session.user, "avatar-medium"),
        navbar_settings: frappe.boot.navbar_settings
      }));
      $(".dropdown-toggle").dropdown();
      this.setup_awesomebar();
      this.setup_notifications();
      this.setup_help();
      this.make();
    }
    make() {
      this.bind_events();
      $(document).trigger("toolbar_setup");
    }
    bind_events() {
      $(document).on("page-change", function() {
        $("header .navbar .custom-menu").remove();
      });
      $("#search-modal").on("shown.bs.modal", function() {
        var search_modal = $(this);
        setTimeout(function() {
          search_modal.find("#modal-search").focus();
        }, 300);
      });
      $(".navbar-toggle-full-width").click(() => {
        frappe.ui.toolbar.toggle_full_width();
      });
    }
    setup_help() {
      if (!frappe.boot.desk_settings.notifications) {
        $(".navbar .vertical-bar").removeClass("d-sm-block");
        $(".dropdown-help").removeClass("d-lg-block");
        return;
      }
      frappe.provide("frappe.help");
      frappe.help.show_results = show_results;
      this.search = new frappe.search.SearchDialog();
      frappe.provide("frappe.searchdialog");
      frappe.searchdialog.search = this.search;
      $(".dropdown-help .dropdown-toggle").on("click", function() {
        $(".dropdown-help input").focus();
      });
      $(".dropdown-help .dropdown-menu").on("click", "input, button", function(e) {
        e.stopPropagation();
      });
      $("#input-help").on("keydown", function(e) {
        if (e.which == 13) {
          $(this).val("");
        }
      });
      $(document).on("page-change", function() {
        var $help_links = $(".dropdown-help #help-links");
        $help_links.html("");
        var route = frappe.get_route_str();
        var breadcrumbs = route.split("/");
        var links = [];
        for (var i = 0; i < breadcrumbs.length; i++) {
          var r = route.split("/", i + 1);
          var key = r.join("/");
          var help_links = frappe.help.help_links[key] || [];
          links = $.merge(links, help_links);
        }
        if (links.length === 0) {
          $help_links.next().hide();
        } else {
          $help_links.next().show();
        }
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          var url = link.url;
          $("<a>", {
            href: url,
            class: "dropdown-item",
            text: link.label,
            target: "_blank"
          }).appendTo($help_links);
        }
        $(".dropdown-help .dropdown-menu").on("click", "a", show_results);
      });
      var $result_modal = frappe.get_modal("", "");
      $result_modal.addClass("help-modal");
      $(document).on("click", ".help-modal a", show_results);
      function show_results(e) {
        var href = e.target.href;
        if (href.indexOf("blob") > 0) {
          window.open(href, "_blank");
        }
        var path = $(e.target).attr("data-path");
        if (path) {
          e.preventDefault();
        }
      }
    }
    setup_awesomebar() {
      if (frappe.boot.desk_settings.search_bar) {
        let awesome_bar = new frappe.search.AwesomeBar();
        awesome_bar.setup("#navbar-search");
        frappe.search.utils.make_function_searchable(function() {
          frappe.set_route("List", "Client Script");
        }, __("Custom Script List"));
      }
    }
    setup_notifications() {
      if (frappe.boot.desk_settings.notifications && frappe.session.user !== "Guest") {
        this.notifications = new frappe.ui.Notifications();
      }
    }
  };
  $.extend(frappe.ui.toolbar, {
    add_dropdown_button: function(parent, label, click, icon) {
      var menu = frappe.ui.toolbar.get_menu(parent);
      if (menu.find("li:not(.custom-menu)").length && !menu.find(".divider").length) {
        frappe.ui.toolbar.add_menu_divider(menu);
      }
      return $('<li class="custom-menu"><a><i class="fa-fw ' + icon + '"></i> ' + label + "</a></li>").insertBefore(menu.find(".divider")).find("a").click(function() {
        click.apply(this);
      });
    },
    get_menu: function(label) {
      return $("#navbar-" + label.toLowerCase());
    },
    add_menu_divider: function(menu) {
      menu = typeof menu == "string" ? frappe.ui.toolbar.get_menu(menu) : menu;
      $('<li class="divider custom-menu"></li>').prependTo(menu);
    },
    add_icon_link(route, icon, index, class_name) {
      let parent_element = $(".navbar-right").get(0);
      let new_element = $(`<li class="${class_name}">
			<a class="btn" href="${route}" title="${frappe.utils.to_title_case(class_name, true)}" aria-haspopup="true" aria-expanded="true">
				<div>
					<i class="octicon ${icon}"></i>
				</div>
			</a>
		</li>`).get(0);
      parent_element.insertBefore(new_element, parent_element.children[index]);
    },
    toggle_full_width() {
      let fullwidth = JSON.parse(localStorage.container_fullwidth || "false");
      fullwidth = !fullwidth;
      localStorage.container_fullwidth = fullwidth;
      frappe.ui.toolbar.set_fullwidth_if_enabled();
      $(document.body).trigger("toggleFullWidth");
    },
    set_fullwidth_if_enabled() {
      let fullwidth = JSON.parse(localStorage.container_fullwidth || "false");
      $(document.body).toggleClass("full-width", fullwidth);
    },
    show_shortcuts(e) {
      e.preventDefault();
      frappe.ui.keys.show_keyboard_shortcut_dialog();
      return false;
    }
  });
  frappe.ui.toolbar.clear_cache = frappe.utils.throttle(function() {
    frappe.assets.clear_local_storage();
    frappe.xcall("frappe.sessions.clear").then((message) => {
      frappe.show_alert({
        message,
        indicator: "info"
      });
      location.reload(true);
    });
  }, 1e4);
  frappe.ui.toolbar.show_about = function() {
    try {
      frappe.ui.misc.about();
    } catch (e) {
      console.log(e);
    }
    return false;
  };
  frappe.ui.toolbar.route_to_user = function() {
    frappe.set_route("Form", "User", frappe.session.user);
  };
  frappe.ui.toolbar.view_website = function() {
    let website_tab = window.open();
    website_tab.opener = null;
    website_tab.location = "/index";
  };
  frappe.ui.toolbar.setup_session_defaults = function() {
    let fields = [];
    frappe.call({
      method: "frappe.core.doctype.session_default_settings.session_default_settings.get_session_default_values",
      callback: function(data) {
        fields = JSON.parse(data.message);
        let perms = frappe.perm.get_perm("Session Default Settings");
        if (in_list(frappe.user_roles, "System Manager") || perms[0].read == 1) {
          fields[fields.length] = {
            "fieldname": "settings",
            "fieldtype": "Button",
            "label": __("Settings"),
            "click": () => {
              frappe.set_route("Form", "Session Default Settings", "Session Default Settings");
            }
          };
        }
        frappe.prompt(fields, function(values) {
          fields.forEach(function(d) {
            if (!values[d.fieldname]) {
              values[d.fieldname] = "";
            }
          });
          frappe.call({
            method: "frappe.core.doctype.session_default_settings.session_default_settings.set_session_default_values",
            args: {
              default_values: values
            },
            callback: function(data2) {
              if (data2.message == "success") {
                frappe.show_alert({
                  "message": __("Session Defaults Saved"),
                  "indicator": "green"
                });
                frappe.ui.toolbar.clear_cache();
              } else {
                frappe.show_alert({
                  "message": __("An error occurred while setting Session Defaults"),
                  "indicator": "red"
                });
              }
            }
          });
        }, __("Session Defaults"), __("Save"));
      }
    });
  };

  // ../vroha/vroha/public/js/frappe/views/file/file_view.js
  frappe.views.FileView = class FileViewCustom extends frappe.views.FileView {
    show() {
      if (!frappe.user.has_role("Customer", "Packers User") || frappe.user.has_role("Administrator", "System Manager")) {
        super.show();
      } else {
        frappe.msgprint({
          message: __("This page you trying to visit is not available or else you do not have a permission to visit this page."),
          title: __("Page Not Found"),
          indicator: "red",
          primary_action: {
            action: function() {
              frappe.set_route("app");
            }
          },
          primary_action_label: __("Home")
        });
      }
    }
  };
})();
//# sourceMappingURL=deskcustom.bundle.QTWFYYUZ.js.map
