from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Product, UserProfile, Order, OrderItem, Feedback, Category
from .serializers import (
    ProductSerializer, UserProfileSerializer, OrderSerializer,
    OrderItemSerializer, FeedbackSerializer, CategorySerializer
)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    @action(detail=False, methods=['post'])
    def login_or_register(self, request):
        email = request.data.get('email')
        name = request.data.get('name', 'User')

        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = UserProfile.objects.get_or_create(
            email=email,
            defaults={'name': name, 'role': 'customer'}
        )
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

    def create(self, request, *args, **kwargs):
        items_data = request.data.pop('items', [])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        for item in items_data:
            OrderItem.objects.create(
                order=order,
                product_name=item.get('name', item.get('product_name', 'Item')),
                price=item.get('price', 0),
                quantity=item.get('quantity', 1)
            )

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().order_by('-created_at')
    serializer_class = FeedbackSerializer
