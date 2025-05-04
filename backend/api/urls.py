from django.urls import path, include
 
urlpatterns = [
    path('predict/', include('api.predict_urls')),
] 