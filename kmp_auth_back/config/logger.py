import logging.config
import os

from config.base_dir import BASE_DIR

if not os.path.exists(f'{BASE_DIR}/logs'):
    os.makedirs(f'{BASE_DIR}/logs')

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        },
    },
    'handlers': {
        'file_info': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': f'{BASE_DIR}/logs/info.log',
            'formatter': 'default',
            'encoding': 'utf-8',
        },
        'file_error': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': f'{BASE_DIR}/logs/error.log',
            'formatter': 'default',
            'encoding': 'utf-8',
        },
        'stdout': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'default',
        },
    },
    'loggers': {
        'INFO_LOGGER': {
            'handlers': ['file_info', 'stdout'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'ERROR_LOGGER': {
            'handlers': ['file_error', 'stdout'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}

logging.config.dictConfig(LOGGING_CONFIG)


def log_error(message: str):
    logger = logging.getLogger('ERROR_LOGGER')
    logger.error(message)


def log_info(message: str):
    logger = logging.getLogger('INFO_LOGGER')
    logger.info(message)
