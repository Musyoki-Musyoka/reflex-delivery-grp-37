from django.db import migrations, models


RETAILERS = [
    {"retailer_name": "Default retailer", "retailer_phone": "0000000000"},
]

DISPATCHERS = [
    {"dispatcher_name": "Default dispatcher", "dispatcher_phone": "0700000000"},
]

RIDERS = [
    {"rider_name": "Peter", "rider_phone": "0712345678"},
    {"rider_name": "James", "rider_phone": "0723456789"},
    {"rider_name": "Mary", "rider_phone": "0734567890"},
]


def seed_users(apps, schema_editor):
    Retailer = apps.get_model("sprint", "retailer")
    Dispatcher = apps.get_model("sprint", "dispatcher")
    Rider = apps.get_model("sprint", "rider")

    for model, users in ((Retailer, RETAILERS), (Dispatcher, DISPATCHERS), (Rider, RIDERS)):
        for user in users:
            if not model.objects.filter(**user).exists():
                model.objects.create(**user)


class Migration(migrations.Migration):

    dependencies = [
        ("sprint", "0004_delivery_request_defaults"),
    ]

    operations = [
        migrations.AlterField(
            model_name="retailer",
            name="retailer_id",
            field=models.AutoField(primary_key=True, serialize=False),
        ),
        migrations.RunPython(seed_users, migrations.RunPython.noop),
    ]
