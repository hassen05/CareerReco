# Generated by Django 5.1.5 on 2025-02-05 19:56

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Resume",
            fields=[
                (
                    "id",
                    models.CharField(max_length=36, primary_key=True, serialize=False),
                ),
                ("name", models.CharField(max_length=100)),
                ("email", models.EmailField(max_length=254)),
                ("phone", models.CharField(max_length=20)),
                ("address", models.TextField()),
                ("education", models.CharField(max_length=200)),
                ("skills", models.JSONField(default=list)),
                ("experience", models.JSONField(default=dict)),
                ("languages", models.JSONField(default=list)),
                ("dob", models.DateField()),
                ("embedding", models.BinaryField(blank=True, null=True)),
            ],
        ),
    ]
