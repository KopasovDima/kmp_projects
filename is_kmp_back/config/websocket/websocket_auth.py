import datetime
import json
from datetime import timedelta

import jwt

from is_kmp.utils.auth_service import verify_user_auth


async def receive_auth_token(consumer, received_message: str | None):
    if not received_message:
        await consumer.send(json.dumps({
            'error': 'Empty message content',
            'code': 400,
        }))
        return

    text_data_json = json.loads(received_message)

    await check_auth_required(consumer)

    if await validate_auth(consumer, text_data_json):
        if await consumer.confirm_access():
            consumer.scope['access_confirmed'] = True
            await consumer.send(json.dumps({
                'message': 'Authorization complete',
                'code': 200,
            }))


async def validate_auth(consumer, received_message: dict = dict):
    try:
        if auth_token := received_message.get('authorization'):
            auth_resp = verify_user_auth(auth_token)

            if not (user_id := auth_resp.get('user_id')):
                raise Exception()

            consumer.scope['user_id'] = user_id
            consumer.scope['user_company_id'] = auth_resp['user_company_id']
            consumer.scope['user_roles'] = auth_resp['user_roles']
            consumer.scope['next_validation_date'] = (
                    datetime.datetime.fromtimestamp(
                        jwt.decode(
                            auth_token.replace('Bearer ', ''),
                            options={'verify_signature': False}
                        ).get('exp')
                    ) - timedelta(minutes=2)
            ).isoformat()

            return True

        if 'user_id' not in consumer.scope:
            await consumer.send(json.dumps({
                'type': 'error',
                'message': 'Auth required',
                'code': 401,
            }))
            return False

        return True

    except (Exception,):
        await consumer.send(json.dumps({
            'type': 'error',
            'message': 'Auth required',
            'code': 401,
        }))


async def check_auth_required(consumer):
    if consumer.scope.get('access_confirmed') and (next_validation_date := consumer.scope.get('next_validation_date')):
        next_validation_date = datetime.datetime.fromisoformat(next_validation_date)
        if next_validation_date < datetime.datetime.now():
            consumer.scope['access_confirmed'] = False
