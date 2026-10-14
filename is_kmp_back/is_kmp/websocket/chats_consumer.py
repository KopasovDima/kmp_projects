import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from config.websocket import websocket_auth
from is_kmp.models.chat import Chat


class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.chat_id = None
        self.room_group_name = None

    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'chat_{self.chat_id}'

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
        if not await self.is_participant(self.scope.get('user_id'), self.chat_id):
            await self.send(json.dumps({
                'message': 'Not participant of this chat',
                'code': 400,
            }))
            await self.close()
            return False
        return True

    @database_sync_to_async
    def is_participant(self, user_id, chat_id):
        chat = Chat.objects.filter(id=chat_id).first()
        if not chat:
            return False
        return chat.participants.filter(user_id=user_id).exists()

    async def receive(self, text_data):
        await websocket_auth.receive_auth_token(self, text_data)

    async def chat_message(self, event):
        await websocket_auth.check_auth_required(self)

        if not self.scope.get('access_confirmed'):
            return

        if 'user_id' in event and event.get('user_id') != self.scope.get('user_id'):
            return

        message_id = event['message_id']

        await self.send(json.dumps({
            'message_id': message_id,
        }))

    async def force_disconnect(self, event):
        if event.get('user_id') == self.scope.get('user_id'):
            await self.send(json.dumps({
                'message': 'Exiting chat',
            }))
            await self.close()
