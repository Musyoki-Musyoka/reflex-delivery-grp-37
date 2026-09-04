from django.db.migrations import serializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.shortcuts import get_object_or_404
from .models import delivery_request, assignment, confirmation, rider, retailer
from .serializers import (
    DeliveryRequestSerializer, DeliveryRequestDetailSerializer,
    AssignmentSerializer, ConfirmationSerializer, RiderSerializer
)


def get_default_retailer():
    """Return the retailer used until retailer authentication is added."""
    default_retailer, _ = retailer.objects.get_or_create(
        retailer_name='Default retailer',
        defaults={'retailer_phone': '0000000000'},
    )
    return default_retailer


class RetailerCreateRequestView(generics.CreateAPIView):
    queryset = delivery_request.objects.all()
    serializer_class = DeliveryRequestSerializer

    def perform_create(self, serializer):
        # This project does not authenticate retailers yet, so create requests
        # under a local default retailer. Do not use auth.User here: the
        # delivery_request.retailer field points to sprint.retailer.
        default_retailer = get_default_retailer()
        serializer.save(retailer=default_retailer, delivery_status='PENDING')

class RetailerRequestListView(generics.ListAPIView):
    serializer_class = DeliveryRequestSerializer

    def get_queryset(self):
        retailer_id = self.request.query_params.get('retailer_id')
        if retailer_id:
            return delivery_request.objects.filter(retailer_id=retailer_id)
        return delivery_request.objects.filter(retailer=get_default_retailer())

class DispatcherPendingRequestsView(generics.ListAPIView):
    queryset = delivery_request.objects.filter(delivery_status='PENDING')
    serializer_class = DeliveryRequestSerializer

class DispatcherAssignRiderView(APIView):
    def post(self, request):
        serializer = AssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment_obj = serializer.save()

        req = assignment_obj.delivery_request
        req.delivery_status = 'ASSIGNED'
        req.dispatcher = assignment_obj.dispatcher
        req.save()

        return Response(AssignmentSerializer(assignment_obj).data, status=status.HTTP_201_CREATED)

class RiderAssignedRequestsView(generics.ListAPIView):
    serializer_class = DeliveryRequestDetailSerializer

    def get_queryset(self):
        rider_id = self.request.query_params.get('rider_id')
        request_ids = assignment.objects.filter(rider_id=rider_id).values_list('delivery_request_id', flat=True)
        return delivery_request.objects.filter(request_id__in=request_ids).exclude(delivery_status='DELIVERED')

class RiderMarkPickedView(APIView):
    def patch(self, request, pk):
        req = get_object_or_404(delivery_request, pk=pk)
        if req.delivery_status != 'ASSIGNED':
            return Response({'error': 'Request is not in ASSIGNED state'}, status=400)
        req.delivery_status = 'PICKED'
        req.save()
        return Response(DeliveryRequestSerializer(req).data)

class RiderMarkDeliveredView(APIView):
    def patch(self, request, pk):
        req = get_object_or_404(delivery_request, pk=pk)
        assignment_obj = get_object_or_404(assignment, delivery_request=req)
        scanned_code = request.data.get('code')

        if scanned_code != req.confirmation_code:
            return Response({'error': 'Invalid QR code'}, status=400)

        req.delivery_status = 'DELIVERED'
        req.save()

        conf = confirmation.objects.create(
            code=scanned_code,
            delivery_request=req,
            assignment=assignment_obj
        )
        return Response(ConfirmationSerializer(conf).data, status=201)
    
class RiderListView(generics.ListAPIView):
    queryset = rider.objects.all()
    serializer_class = RiderSerializer
