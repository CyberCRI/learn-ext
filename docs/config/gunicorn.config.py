import os

NODE = os.environ['NODE'].lower()

ports_map = {
  'dash': 8082,
  'udev': 8081,
  'uopt': 8080,
}

PORT = ports_map[NODE]

PRODUCTION = 'PRODUCTION' in os.environ
DEBUG = not PRODUCTION

bind = '127.0.0.1:{0}'.format(ports_map[NODE])

max_requests = 1000
timeout = 60 * 60 * 5 if DEBUG else 60
keep_alive = 2

reload = not PRODUCTION

access_log_format = '%(t)s %(m)s %(s)s ~> %(U)s << %(q)s >>'
capture_output = True


_logfile_root_dir = os.path.expanduser('~/var/log')
os.makedirs(_logfile_root_dir, exist_ok=True)

accesslog = f'{_logfile_root_dir}/{NODE}-access.log'
errorlog = f'{_logfile_root_dir}/{NODE}-error.log'

log_level = 'debug' if DEBUG else 'info'

proc_name = f'ilearn-{NODE}'
