from rest_framework import serializers
from .models import retailer, dispatcher, rider, delivery_request, assignment, confirmation

class DeliveryRequestSerializer(serializers.ModelSerializer):
    # Keep the API's model field and provide the short name used by the
    # retailer page when it renders each request.
    status = serializers.CharField(source='delivery_status', read_only=True)

    class Meta:
        model = delivery_request
        fields = [
            'request_id', 'customer_name', 'customer_phone', 'customer_address',
            'item_description', 'delivery_status', 'status', 'confirmation_code',
            'retailer', 'dispatcher'
        ]
        # These values are set by the server as the delivery moves through
        # its workflow. A retailer creating a request must not send them.
        read_only_fields = ['request_id', 'delivery_status', 'retailer', 'dispatcher']

class DeliveryRequestDetailSerializer(serializers.ModelSerializer):
    # used by the rider — needs retailer + customer info to pick up the package
    retailer_name = serializers.CharField(source='retailer.retailer_name', read_only=True)
    retailer_phone = serializers.CharField(source='retailer.retailer_phone', read_only=True)

    class Meta:
        model = delivery_request
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = assignment
        fields = '__all__'

class ConfirmationSerializer(serializers.ModelSerializer):
    class Meta:
        model = confirmation
        fields = '__all__'

class RiderSerializer(serializers.ModelSerializer):
    class Meta:
        model = rider
        fields = '__all__'
