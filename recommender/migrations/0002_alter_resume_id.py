# Generated by Django 5.1.5 on 2025-01-29 17:46

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("recommender", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="resume",
            name="id",
            field=models.UUIDField(
                default=uuid.uuid4, editable=False, primary_key=True, serialize=False
            ),
        ),
    ]
