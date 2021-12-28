# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: MIT. See LICENSE

# all country info
import os, json

def get_all():
	with open(os.path.join(os.path.dirname(__file__), "dial_code.json"), "r") as local_info:
		all_data = json.loads(local_info.read())
	return all_data
