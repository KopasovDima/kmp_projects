import importlib.util

def is_package_available(package_name):
    return importlib.util.find_spec(package_name) is not None

def is_debug_toolbar_install():
    return is_package_available('debug_toolbar')
