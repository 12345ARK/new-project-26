from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home_view(request):
    return JsonResponse({
        "message": "Welcome to FastMart Django API Backend!",
        "status": "running",
        "endpoints": {
            "api_root": "/api/",
            "products": "/api/products/",
            "users": "/api/users/",
            "orders": "/api/orders/",
            "feedback": "/api/feedback/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
