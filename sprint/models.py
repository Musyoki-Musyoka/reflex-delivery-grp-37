import uuid

from django.db import models

class retailer(models.Model):
    retailer_id = models.AutoField(primary_key=True)
    retailer_name = models.CharField(max_length=100)
    retailer_phone = models.CharField(max_length=15)

    def __str__(self):
        return self.retailer_name

class dispatcher(models.Model):
    dispatcher_id = models.AutoField(primary_key=True)
    dispatcher_name = models.CharField(max_length=100)
    dispatcher_phone = models.CharField(max_length=15)

    def __str__(self):
        return self.dispatcher_name

class rider(models.Model):
    rider_id = models.AutoField(primary_key=True)
    rider_name = models.CharField(max_length=100)
    rider_phone = models.CharField(max_length=15)

    def __str__(self):
        return self.rider_name

class delivery_request(models.Model):
    request_id = models.AutoField(primary_key=True)
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=15)
    customer_address = models.CharField(max_length=200)
    item_description = models.CharField(max_length=200)
    delivery_status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('ASSIGNED', 'Assigned'),
        ('PICKED', 'Picked'),
        ('DELIVERED', 'Delivered')
    ], default='PENDING')
    retailer = models.ForeignKey(retailer, on_delete=models.CASCADE)
    # A dispatcher is selected later, when the request is assigned to a rider.
    dispatcher = models.ForeignKey(dispatcher, on_delete=models.CASCADE, null=True, blank=True)

    confirmation_code = models.CharField(max_length=40, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.confirmation_code:
            self.confirmation_code = f"REFLEX-DELIVERY-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"Request {self.request_id} - {self.delivery_status}"

class assignment(models.Model):
    assignment_id = models.AutoField(primary_key=True)
    delivery_request = models.ForeignKey(delivery_request, on_delete=models.CASCADE)
    dispatcher = models.ForeignKey(dispatcher, on_delete=models.CASCADE)
    rider = models.ForeignKey(rider, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Assignment {self.assignment_id} - Request {self.delivery_request.request_id} to Rider {self.rider.rider_name}"

class confirmation(models.Model):
    confirmation_id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=10)
    delivery_request = models.ForeignKey(delivery_request, on_delete=models.CASCADE)
    assignment = models.ForeignKey(assignment, on_delete=models.CASCADE)
    confirmed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Confirmation {self.confirmation_id} for Assignment {self.assignment.assignment_id}"
