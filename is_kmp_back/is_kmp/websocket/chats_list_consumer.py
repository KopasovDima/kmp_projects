import json

from channels.generic.websocket import AsyncWebsocketConsumer

from config.websocket import websocket_auth


class ChatListConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user_id = None
        self.room_group_name = None

    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'user_{self.user_id}'

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
        if self.scope.get('user_id') != self.user_id:
            await self.send(json.dumps({
                'message': 'Connected to another user',
                'code': 400,
            }))
            await self.close()
            return False
        return True

    async def receive(self, text_data):
        await websocket_auth.receive_auth_token(self, text_data)

    async def chat_update(self, _):
        await websocket_auth.check_auth_required(self)

        if not self.scope.get('access_confirmed'):
            return

        await self.send(json.dumps({
            'user_chats_updated': True,
        }))
