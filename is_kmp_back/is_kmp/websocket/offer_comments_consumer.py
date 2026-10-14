import json

from channels.generic.websocket import AsyncWebsocketConsumer

from config.websocket import websocket_auth


class OfferCommentsConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.offer_id = None
        self.room_group_name = None

    async def connect(self):
        self.offer_id = self.scope['url_route']['kwargs']['offer_id']
        self.room_group_name = f'offer_{self.offer_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def confirm_access(self):
        return True

    async def receive(self, text_data):
        await websocket_auth.receive_auth_token(self, text_data)

    async def offer_comment(self, event):
        await websocket_auth.check_auth_required(self)

        if not self.scope.get('access_confirmed'):
            return

        if 'user_id' in event and event.get('user_id') != self.scope.get('user_id'):
            return

        comment_id = event['comment_id']

        await self.send(json.dumps({
            'comment_id': comment_id,
        }))
