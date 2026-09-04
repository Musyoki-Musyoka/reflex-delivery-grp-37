from django.urls import path
from . import views

urlpatterns = [
    path('requests/create/', views.RetailerCreateRequestView.as_view()),
    path('requests/mine/', views.RetailerRequestListView.as_view()),

    path('dispatcher/pending/', views.DispatcherPendingRequestsView.as_view()),
    path('dispatcher/assign/', views.DispatcherAssignRiderView.as_view()),

    path('rider/assigned/', views.RiderAssignedRequestsView.as_view()),
    path('requests/<int:pk>/picked/', views.RiderMarkPickedView.as_view()),
    path('requests/<int:pk>/delivered/', views.RiderMarkDeliveredView.as_view()),
    path('riders/', views.RiderListView.as_view()),
]