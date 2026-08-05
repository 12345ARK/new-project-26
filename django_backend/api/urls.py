from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, UserProfileViewSet, OrderViewSet, FeedbackViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'users', UserProfileViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'feedback', FeedbackViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
