from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def send_event_to_socket(group_name, event_type, event_params=None):
    if event_params is None:
        event_params = {
            'type': event_type,
        }
    else:
        event_params['type'] = event_type

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(group_name, event_params)
