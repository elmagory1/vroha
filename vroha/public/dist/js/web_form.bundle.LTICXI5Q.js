(() => {
  // frappe/public/js/frappe/utils/datetime.js
  frappe.provide("frappe.datetime");
  frappe.defaultDateFormat = "YYYY-MM-DD";
  frappe.defaultTimeFormat = "HH:mm:ss";
  frappe.defaultDatetimeFormat = frappe.defaultDateFormat + " " + frappe.defaultTimeFormat;
  moment.defaultFormat = frappe.defaultDateFormat;
  frappe.provide("frappe.datetime");
  $.extend(frappe.datetime, {
    convert_to_user_tz: function(date, format) {
      let date_obj = null;
      if (frappe.boot.time_zone && frappe.boot.time_zone.system && frappe.boot.time_zone.user) {
        date_obj = moment.tz(date, frappe.boot.time_zone.system).clone().tz(frappe.boot.time_zone.user);
      } else {
        date_obj = moment(date);
      }
      return format === false ? date_obj : date_obj.format(frappe.defaultDatetimeFormat);
    },
    convert_to_system_tz: function(date, format) {
      let date_obj = null;
      if (frappe.boot.time_zone && frappe.boot.time_zone.system && frappe.boot.time_zone.user) {
        date_obj = moment.tz(date, frappe.boot.time_zone.user).clone().tz(frappe.boot.time_zone.system);
      } else {
        date_obj = moment(date);
      }
      return format === false ? date_obj : date_obj.format(frappe.defaultDatetimeFormat);
    },
    is_system_time_zone: function() {
      if (frappe.boot.time_zone && frappe.boot.time_zone.system && frappe.boot.time_zone.user) {
        return moment().tz(frappe.boot.time_zone.system).utcOffset() === moment().tz(frappe.boot.time_zone.user).utcOffset();
      }
      return true;
    },
    is_timezone_same: function() {
      return frappe.datetime.is_system_time_zone();
    },
    str_to_obj: function(d) {
      return moment(d, frappe.defaultDatetimeFormat)._d;
    },
    obj_to_str: function(d) {
      return moment(d).locale("en").format();
    },
    obj_to_user: function(d) {
      return moment(d).format(frappe.datetime.get_user_date_fmt().toUpperCase());
    },
    get_diff: function(d1, d2) {
      return moment(d1).diff(d2, "days");
    },
    get_hour_diff: function(d1, d2) {
      return moment(d1).diff(d2, "hours");
    },
    get_day_diff: function(d1, d2) {
      return moment(d1).diff(d2, "days");
    },
    add_days: function(d, days) {
      return moment(d).add(days, "days").format();
    },
    add_months: function(d, months) {
      return moment(d).add(months, "months").format();
    },
    week_start: function() {
      return moment().startOf("week").format();
    },
    week_end: function() {
      return moment().endOf("week").format();
    },
    month_start: function() {
      return moment().startOf("month").format();
    },
    month_end: function() {
      return moment().endOf("month").format();
    },
    quarter_start: function() {
      return moment().startOf("quarter").format();
    },
    quarter_end: function() {
      return moment().endOf("quarter").format();
    },
    year_start: function() {
      return moment().startOf("year").format();
    },
    year_end: function() {
      return moment().endOf("year").format();
    },
    get_user_time_fmt: function() {
      return frappe.sys_defaults && frappe.sys_defaults.time_format || "HH:mm:ss";
    },
    get_user_date_fmt: function() {
      return frappe.sys_defaults && frappe.sys_defaults.date_format || "yyyy-mm-dd";
    },
    get_user_fmt: function() {
      return frappe.sys_defaults && frappe.sys_defaults.date_format || "yyyy-mm-dd";
    },
    str_to_user: function(val, only_time = false) {
      if (!val)
        return "";
      const user_date_fmt = frappe.datetime.get_user_date_fmt().toUpperCase();
      const user_time_fmt = frappe.datetime.get_user_time_fmt();
      let user_format = user_time_fmt;
      if (only_time) {
        let date_obj = moment(val, frappe.defaultTimeFormat);
        return date_obj.format(user_format);
      } else {
        let date_obj = moment.tz(val, frappe.boot.time_zone.system);
        if (typeof val !== "string" || val.indexOf(" ") === -1) {
          user_format = user_date_fmt;
        } else {
          user_format = user_date_fmt + " " + user_time_fmt;
        }
        return date_obj.clone().tz(frappe.boot.time_zone.user).format(user_format);
      }
    },
    get_datetime_as_string: function(d) {
      return moment(d).format("YYYY-MM-DD HH:mm:ss");
    },
    user_to_str: function(val, only_time = false) {
      var user_time_fmt = frappe.datetime.get_user_time_fmt();
      if (only_time) {
        return moment(val, user_time_fmt).format(frappe.defaultTimeFormat);
      }
      var user_fmt = frappe.datetime.get_user_date_fmt().toUpperCase();
      var system_fmt = "YYYY-MM-DD";
      if (val.indexOf(" ") !== -1) {
        user_fmt += " " + user_time_fmt;
        system_fmt += " HH:mm:ss";
      }
      return moment(val, [
        user_fmt.replace("YYYY", "YY"),
        user_fmt
      ]).locale("en").format(system_fmt);
    },
    user_to_obj: function(d) {
      return frappe.datetime.str_to_obj(frappe.datetime.user_to_str(d));
    },
    global_date_format: function(d) {
      var m = moment(d);
      if (m._f && m._f.indexOf("HH") !== -1) {
        return m.format("Do MMMM YYYY, h:mma");
      } else {
        return m.format("Do MMMM YYYY");
      }
    },
    now_date: function(as_obj = false) {
      return frappe.datetime._date(frappe.defaultDateFormat, as_obj);
    },
    now_time: function(as_obj = false) {
      return frappe.datetime._date(frappe.defaultTimeFormat, as_obj);
    },
    now_datetime: function(as_obj = false) {
      return frappe.datetime._date(frappe.defaultDatetimeFormat, as_obj);
    },
    _date: function(format, as_obj = false) {
      let time_zone = frappe.boot.time_zone ? frappe.boot.time_zone.user || frappe.boot.time_zone.system : frappe.sys_defaults.time_zone;
      let date = moment.tz(time_zone);
      return as_obj ? frappe.datetime.moment_to_date_obj(date) : date.format(format);
    },
    moment_to_date_obj: function(moment_obj) {
      const date_obj = new Date();
      const date_array = moment_obj.toArray();
      date_obj.setFullYear(date_array[0]);
      date_obj.setMonth(date_array[1]);
      date_obj.setDate(date_array[2]);
      date_obj.setHours(date_array[3]);
      date_obj.setMinutes(date_array[4]);
      date_obj.setSeconds(date_array[5]);
      date_obj.setMilliseconds(date_array[6]);
      return date_obj;
    },
    nowdate: function() {
      return frappe.datetime.now_date();
    },
    get_today: function() {
      return frappe.datetime.now_date();
    },
    get_time: (timestamp) => {
      return moment(timestamp).format("hh:mm A");
    },
    validate: function(d) {
      return moment(d, [
        frappe.defaultDateFormat,
        frappe.defaultDatetimeFormat,
        frappe.defaultTimeFormat
      ], true).isValid();
    }
  });
  Object.defineProperties(window, {
    "dateutil": {
      get: function() {
        console.warn("Please use `frappe.datetime` instead of `dateutil`. It will be deprecated soon.");
        return frappe.datetime;
      },
      configurable: true
    },
    "date": {
      get: function() {
        console.warn("Please use `frappe.datetime` instead of `date`. It will be deprecated soon.");
        return frappe.datetime;
      },
      configurable: true
    },
    "get_today": {
      get: function() {
        console.warn("Please use `frappe.datetime.get_today` instead of `get_today`. It will be deprecated soon.");
        return frappe.datetime.get_today;
      },
      configurable: true
    }
  });

  // ../vroha/vroha/public/js/frappe/web_form/web_form_list.js
  frappe.provide("frappe.ui");
  frappe.provide("frappe.views");
  frappe.provide("frappe.web_form_list");
  var WebFormList = class {
    constructor(opts) {
      Object.assign(this, opts);
      frappe.web_form_list = this;
      this.wrapper = document.getElementById("datatable");
      this.make_actions();
      this.make_filters();
      $(".link-btn").remove();
    }
    refresh() {
      if (this.table) {
        Array.from(this.table.tBodies).forEach((tbody) => tbody.remove());
        let check = document.getElementById("select-all");
        check.checked = false;
      }
      this.rows = [];
      this.page_length = 20;
      this.web_list_start = 0;
      frappe.run_serially([
        () => this.get_list_view_fields(),
        () => this.get_data(),
        () => this.make_table(),
        () => this.create_more()
      ]);
    }
    make_filters() {
      this.filters = {};
      this.filter_input = [];
      const filter_area = document.getElementById("list-filters");
      frappe.call("frappe.website.doctype.web_form.web_form.get_web_form_filters", {
        web_form_name: this.web_form_name
      }).then((response) => {
        let fields = response.message;
        fields.forEach((field) => {
          let col = document.createElement("div.col-sm-4");
          col.classList.add("col", "col-sm-3");
          filter_area.appendChild(col);
          if (field.default)
            this.add_filter(field.fieldname, field.default, field.fieldtype);
          let input = frappe.ui.form.make_control({
            df: {
              fieldtype: field.fieldtype,
              fieldname: field.fieldname,
              options: field.options,
              only_select: true,
              label: __(field.label),
              onchange: (event) => {
                $("#more").remove();
                this.add_filter(field.fieldname, input.value, field.fieldtype);
                this.refresh();
              }
            },
            parent: col,
            value: field.default,
            render_input: 1
          });
          this.filter_input.push(input);
        });
        this.refresh();
      });
    }
    add_filter(field, value, fieldtype) {
      if (!value) {
        delete this.filters[field];
      } else {
        if (fieldtype === "Data")
          value = ["like", value + "%"];
        Object.assign(this.filters, Object.fromEntries([[field, value]]));
      }
    }
    get_list_view_fields() {
      return frappe.call({
        method: "frappe.website.doctype.web_form.web_form.get_in_list_view_fields",
        args: {doctype: this.doctype}
      }).then((response) => this.fields_list = response.message);
    }
    fetch_data() {
      return frappe.call({
        method: "frappe.www.list.get_list_data",
        args: {
          doctype: this.doctype,
          fields: this.fields_list.map((df) => df.fieldname),
          limit_start: this.web_list_start,
          web_form_name: this.web_form_name,
          ...this.filters
        }
      });
    }
    async get_data() {
      let response = await this.fetch_data();
      this.data = await response.message;
    }
    more() {
      this.web_list_start += this.page_length;
      this.fetch_data().then((res) => {
        if (res.message.length === 0) {
          frappe.msgprint(__("No more items to display"));
        }
        this.append_rows(res.message);
      });
    }
    make_table() {
      this.columns = this.fields_list.map((df) => {
        return {
          label: df.label,
          fieldname: df.fieldname,
          fieldtype: df.fieldtype
        };
      });
      if (!this.table) {
        this.table = document.createElement("table");
        this.table.classList.add("table");
        this.make_table_head();
      }
      this.append_rows(this.data);
      this.wrapper.appendChild(this.table);
    }
    make_table_head() {
      let thead = this.table.createTHead();
      thead.style.backgroundColor = "#f7fafc";
      thead.style.color = "#8d99a6";
      let row = thead.insertRow();
      let th = document.createElement("th");
      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "select-all";
      checkbox.onclick = (event) => this.toggle_select_all(event.target.checked);
      th.appendChild(checkbox);
      row.appendChild(th);
      add_heading(row, __("Sr"));
      this.columns.forEach((col) => {
        add_heading(row, __(col.label));
      });
      function add_heading(row2, label) {
        let th2 = document.createElement("th");
        th2.innerText = label;
        row2.appendChild(th2);
      }
    }
    append_rows(row_data) {
      const tbody = this.table.childNodes[1] || this.table.createTBody();
      row_data.forEach((data_item) => {
        let row_element = tbody.insertRow();
        row_element.setAttribute("id", data_item.name);
        let row = new frappe.ui.WebFormListRow({
          row: row_element,
          doc: data_item,
          columns: this.columns,
          serial_number: this.rows.length + 1,
          events: {
            onEdit: () => this.open_form(data_item.name),
            onSelect: () => this.toggle_delete()
          }
        });
        this.rows.push(row);
      });
    }
    make_actions() {
      const actions = document.querySelector(".list-view-actions");
      frappe.has_permission(this.doctype, "", "delete", () => {
        this.addButton(actions, "delete-rows", "danger", true, "Delete", () => this.delete_rows());
      });
      if (this.settings.has_perm) {
        frappe.has_permission(this.doctype, "", "create", () => {
          this.addButton(actions, "new", "primary", false, "New", () => window.location.href = window.location.pathname + "?new=1");
        });
      } else {
        this.addButton(actions, "new", "primary", false, "New", () => window.location.href = window.location.pathname + "?new=1");
      }
    }
    addButton(wrapper, id, type, hidden, name, action) {
      if (document.getElementById(id))
        return;
      const button = document.createElement("a");
      if (type == "secondary") {
        button.classList.add("ml-2", "text-uppercase", "bg-primary", "text-center", "text-white", "font-xsss", "fw-600", "p-3", "w175", "rounded-lg", "d-inline-block");
      } else if (type == "danger") {
        button.classList.add("ml-2", "text-uppercase", "bg-danger", "button-delete", "text-center", "text-white", "font-xsss", "fw-600", "p-3", "w175", "rounded-lg", "d-inline-block");
      } else {
        button.classList.add("ml-2", "text-uppercase", "bg-current", "text-center", "text-white", "font-xsss", "fw-600", "p-3", "w175", "rounded-lg", "d-inline-block");
      }
      button.href = "#";
      button.id = id;
      button.innerText = name;
      button.hidden = hidden;
      button.onclick = action;
      wrapper.appendChild(button);
    }
    create_more() {
      if (this.rows.length >= this.page_length) {
        const footer = document.querySelector(".list-view-footer");
        this.addButton(footer, "more", "secondary", false, "More", () => this.more());
      }
    }
    toggle_select_all(checked) {
      this.rows.forEach((row) => row.toggle_select(checked));
    }
    open_form(name) {
      window.location.href = window.location.pathname + "?name=" + name;
    }
    get_selected() {
      return this.rows.filter((row) => row.is_selected());
    }
    toggle_delete() {
      if (!this.settings.allow_delete)
        return;
      let btn = document.getElementById("delete-rows");
      btn.hidden = !this.get_selected().length;
    }
    delete_rows() {
      if (!this.settings.allow_delete)
        return;
      frappe.call({
        type: "POST",
        method: "frappe.website.doctype.web_form.web_form.delete_multiple",
        args: {
          web_form_name: this.web_form_name,
          docnames: this.get_selected().map((row) => row.doc.name)
        }
      }).then(() => {
        this.refresh();
        this.toggle_delete();
      });
    }
  };
  var web_form_list_default = WebFormList;
  frappe.ui.WebFormListRow = class WebFormListRow {
    constructor({row, doc, columns, serial_number, events, options}) {
      Object.assign(this, {row, doc, columns, serial_number, events});
      this.make_row();
    }
    make_row() {
      let cell = this.row.insertCell();
      this.checkbox = document.createElement("input");
      this.checkbox.type = "checkbox";
      this.checkbox.onclick = (event) => {
        this.toggle_select(event.target.checked);
        event.stopImmediatePropagation();
      };
      cell.appendChild(this.checkbox);
      let serialNo = this.row.insertCell();
      serialNo.innerText = this.serial_number;
      this.columns.forEach((field) => {
        let cell2 = this.row.insertCell();
        let formatter = frappe.form.get_formatter(field.fieldtype);
        cell2.innerHTML = this.doc[field.fieldname] && __(formatter(this.doc[field.fieldname], field, {only_value: 1}, this.doc)) || "";
      });
      this.row.onclick = () => this.events.onEdit();
      this.row.style.cursor = "pointer";
    }
    toggle_select(checked) {
      this.checkbox.checked = checked;
      this.events.onSelect(checked);
    }
    is_selected() {
      return this.checkbox.checked;
    }
  };

  // ../vroha/vroha/public/js/frappe/event_emitter.js
  frappe.provide("frappe.utils");
  var EventEmitterMixin = {
    init() {
      this.jq = jQuery({});
    },
    trigger(evt, data) {
      !this.jq && this.init();
      this.jq.trigger(evt, data);
    },
    once(evt, handler) {
      !this.jq && this.init();
      this.jq.one(evt, (e, data) => handler(data));
    },
    on(evt, handler) {
      !this.jq && this.init();
      this.jq.bind(evt, (e, data) => handler(data));
    },
    off(evt, handler) {
      !this.jq && this.init();
      this.jq.unbind(evt, (e, data) => handler(data));
    }
  };
  frappe.utils.make_event_emitter = function(object) {
    Object.assign(object, EventEmitterMixin);
    return object;
  };
  var event_emitter_default = EventEmitterMixin;

  // ../vroha/vroha/public/js/frappe/web_form/web_form.js
  frappe.provide("frappe.ui");
  frappe.provide("frappe.web_form");
  var WebForm = class extends frappe.ui.FieldGroup {
    constructor(opts) {
      super();
      Object.assign(this, opts);
      frappe.web_form = this;
      frappe.web_form.events = {};
      Object.assign(frappe.web_form.events, event_emitter_default);
    }
    prepare(web_form_doc, doc) {
      Object.assign(this, web_form_doc);
      this.fields = web_form_doc.web_form_fields;
      this.doc = doc;
    }
    make() {
      super.make();
      this.set_field_values();
      if (this.introduction_text)
        this.set_form_description(this.introduction_text);
      if (this.allow_print && !this.is_new)
        this.setup_print_button();
      if (this.allow_delete && !this.is_new)
        this.setup_delete_button();
      if (this.is_new)
        this.setup_cancel_button();
      this.setup_primary_action();
      $(".link-btn").remove();
      frappe.init_client_script && frappe.init_client_script();
      frappe.web_form.events.trigger("after_load");
      this.after_load && this.after_load();
    }
    on(fieldname, handler) {
      let field = this.fields_dict[fieldname];
      field.df.change = () => {
        handler(field, field.value);
      };
    }
    set_field_values() {
      if (this.doc.name)
        this.set_values(this.doc);
      else
        return;
    }
    set_default_values() {
      let values = frappe.utils.get_query_params();
      delete values.new;
      this.set_values(values);
    }
    set_form_description(intro) {
      let intro_wrapper = document.getElementById("introduction");
      intro_wrapper.innerHTML = intro;
      if (intro_wrapper.textContent == "") {
        intro_wrapper.classList.add("d-none");
      } else {
        intro_wrapper.classList.add("text-grey-700", "border-bottom", "mb-3");
      }
    }
    add_button(name, type, action, wrapper_class = ".web-form-actions") {
      const button = document.createElement("a");
      button.classList.add("ml-2", "text-uppercase", "bg-current", "text-center", "text-white", "font-xsss", "fw-600", "p-3", "w175", "rounded-lg", "d-inline-block");
      button.href = "#";
      button.innerHTML = name;
      button.onclick = action;
      document.querySelector(wrapper_class).appendChild(button);
    }
    add_button_to_footer(name, type, action) {
      this.add_button(name, type, action, ".web-form-footer");
    }
    add_button_to_header(name, type, action) {
      this.add_button(name, type, action, ".web-form-actions");
    }
    setup_primary_action() {
      this.add_button_to_header(this.button_label || "Save", "primary", () => this.save());
      this.add_button_to_footer(this.button_label || "Save", "primary", () => this.save());
    }
    setup_cancel_button() {
      this.add_button_to_header(__("Cancel"), "light", () => this.cancel());
    }
    setup_delete_button() {
      frappe.has_permission(this.doc_type, "", "delete", () => {
        this.add_button_to_header(frappe.utils.icon("delete"), "danger", () => this.delete());
      });
    }
    setup_print_button() {
      this.add_button_to_header(frappe.utils.icon("print"), "light", () => this.print());
    }
    save() {
      let is_new = this.is_new;
      if (this.validate && !this.validate()) {
        frappe.throw(__("Couldn't save, please check the data you have entered"), __("Validation Error"));
      }
      let doc_values = super.get_values(this.allow_incomplete);
      if (!doc_values)
        return;
      if (window.saving)
        return;
      let for_payment = Boolean(this.accept_payment && !this.doc.paid);
      Object.assign(this.doc, doc_values);
      this.doc.doctype = this.doc_type;
      this.doc.web_form_name = this.name;
      window.saving = true;
      frappe.form_dirty = false;
      frappe.call({
        type: "POST",
        method: "frappe.website.doctype.web_form.web_form.accept",
        args: {
          data: this.doc,
          web_form: this.name,
          docname: this.doc.name,
          for_payment
        },
        freeze: true,
        freeze_message: __("Submitting..."),
        callback: (response) => {
          if (!response.exc) {
            frappe.unfreeze();
            this.handle_success(response.message);
            frappe.web_form.events.trigger("after_save");
            this.after_save && this.after_save();
            if (is_new && (response.message.attachment || response.message.file)) {
              frappe.call({
                type: "POST",
                method: "frappe.handler.upload_file",
                args: {
                  file_url: response.message.attachment || response.message.file,
                  doctype: response.message.doctype,
                  docname: response.message.name
                }
              });
            }
          } else {
            frappe.unfreeze();
          }
        },
        always: function() {
          window.saving = false;
        }
      });
      return true;
    }
    delete() {
      frappe.call({
        type: "POST",
        method: "frappe.website.doctype.web_form.web_form.delete",
        args: {
          web_form_name: this.name,
          docname: this.doc.name
        }
      });
    }
    print() {
      window.open(`/printview?
			doctype=${this.doc_type}
			&name=${this.doc.name}
			&format=${this.print_format || "Standard"}`, "_blank");
    }
    cancel() {
      window.location.href = window.location.pathname;
    }
    handle_success(data) {
      if (this.accept_payment && !this.doc.paid) {
        window.location.href = data;
      }
      const success_dialog = new frappe.ui.Dialog({
        title: __("Saved Successfully"),
        secondary_action: () => {
          if (this.success_url) {
            window.location.href = this.success_url;
          } else if (this.login_required) {
            window.location.href = window.location.pathname + "?name=" + data.name;
          }
        }
      });
      success_dialog.show();
      const success_message = this.success_message || __("Your information has been submitted");
      success_dialog.set_message(success_message);
    }
  };
  var web_form_default = WebForm;

  // ../vroha/vroha/public/js/frappe/web_form/webform_script.js
  frappe.ready(function() {
    let query_params = frappe.utils.get_query_params();
    let wrapper = $(".web-form-wrapper");
    let is_list = parseInt(wrapper.data("is-list")) || query_params.is_list;
    let webform_doctype = wrapper.data("web-form-doctype");
    let webform_name = wrapper.data("web-form");
    let login_required = parseInt(wrapper.data("login-required"));
    let allow_delete = parseInt(wrapper.data("allow-delete"));
    let has_perm = parseInt(wrapper.data("has-perm"));
    let doc_name = query_params.name || "";
    let is_new = query_params.new;
    if (login_required)
      show_login_prompt();
    else if (is_list)
      show_grid();
    else
      show_form(webform_doctype, webform_name, is_new);
    document.querySelector("body").style.display = "block";
    function show_login_prompt() {
      const login_required2 = new frappe.ui.Dialog({
        title: __("Not Permitted"),
        indicator: "red",
        primary_action_label: __("Login"),
        primary_action: () => {
          window.location.replace("/login?redirect-to=" + window.location.pathname);
        }
      });
      login_required2.show();
      login_required2.set_message(__("You are not permitted to access this page."));
    }
    function show_grid() {
      new web_form_list_default({
        parent: wrapper,
        doctype: webform_doctype,
        web_form_name: webform_name,
        settings: {
          allow_delete,
          has_perm
        }
      });
    }
    function show_form() {
      let web_form = new web_form_default({
        parent: wrapper,
        is_new,
        web_form_name: webform_name
      });
      get_data().then((r) => {
        const data = setup_fields(r.message);
        let web_form_doc = data.web_form;
        if (web_form_doc.name && web_form_doc.allow_edit === 0) {
          if (!window.location.href.includes("?new=1")) {
            window.location.replace(window.location.pathname + "?new=1");
          }
        }
        let doc = r.message.doc || build_doc(r.message);
        web_form.prepare(web_form_doc, r.message.doc && web_form_doc.allow_edit === 1 ? r.message.doc : {});
        web_form.make();
        web_form.set_default_values();
      });
      function build_doc(form_data) {
        let doc = {};
        form_data.web_form.web_form_fields.forEach((df) => {
          if (df.default)
            return doc[df.fieldname] = df.default;
        });
        return doc;
      }
      function get_data() {
        return frappe.call({
          method: "frappe.website.doctype.web_form.web_form.get_form_data",
          args: {
            doctype: webform_doctype,
            docname: doc_name,
            web_form_name: webform_name
          },
          freeze: true
        });
      }
      function setup_fields(form_data) {
        form_data.web_form.web_form_fields.map((df) => {
          df.is_web_form = true;
          if (df.fieldtype === "Table") {
            df.get_data = () => {
              let data = [];
              if (form_data.doc) {
                data = form_data.doc[df.fieldname];
              }
              return data;
            };
            df.fields = form_data[df.fieldname];
            $.each(df.fields || [], function(_i, field) {
              if (field.fieldtype === "Link") {
                field.only_select = true;
              }
              field.is_web_form = true;
            });
            if (df.fieldtype === "Attach") {
              df.is_private = true;
            }
            delete df.parent;
            delete df.parentfield;
            delete df.parenttype;
            delete df.doctype;
            return df;
          }
          if (df.fieldtype === "Link") {
            df.only_select = true;
          }
          if (["Attach", "Attach Image"].includes(df.fieldtype)) {
            if (typeof df.options !== "object") {
              df.options = {};
            }
            df.options.disable_file_browser = true;
          }
        });
        return form_data;
      }
    }
  });
})();
//# sourceMappingURL=web_form.bundle.LTICXI5Q.js.map
