from django.core.management.base import BaseCommand
from models import rider, retailer, dispatcher


class Command(BaseCommand):
    help = "Create demo riders, retailer and dispatcher"

    def handle(self, *args, **options):

        # Create 3 riders
        riders = [
            ("John Kamau", "0712345678"),
            ("Peter Mwangi", "0723456789"),
            ("David Otieno", "0734567890"),
        ]

        for name, phone in riders:
            rider.objects.get_or_create(
                rider_phone=phone,
                defaults={
                    "rider_name": name,
                }
            )

        # Create 1 retailer
        retailer.objects.get_or_create(
            retailer_phone="0745678901",
            defaults={
                "retailer_name": "Demo Retailer",
            }
        )

        # Create 1 dispatcher
        dispatcher.objects.get_or_create(
            dispatcher_phone="0756789012",
            defaults={
                "dispatcher_name": "Demo Dispatcher",
            }
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Demo data created successfully: "
                "3 riders, 1 retailer, 1 dispatcher."
            )
        )