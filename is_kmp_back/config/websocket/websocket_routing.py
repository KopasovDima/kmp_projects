from django.urls import path

from is_kmp.websocket.chats_consumer import ChatConsumer
from is_kmp.websocket.chats_list_consumer import ChatListConsumer
from is_kmp.websocket.offer_comments_consumer import OfferCommentsConsumer
from is_kmp.websocket.offers_list_consumer import OffersListConsumer

websocket_urlpatterns = [
    path('ws/chats/<int:chat_id>/', ChatConsumer.as_asgi()),
    path('ws/chats_list/<int:user_id>/', ChatListConsumer.as_asgi()),
    path('ws/offers/<int:offer_id>/comments/', OfferCommentsConsumer.as_asgi()),
    path('ws/offers/<int:user_id>/', OffersListConsumer.as_asgi()),
]