# Generated by Django 2.2.24 on 2022-01-18 06:15

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0036_auto_20220104_1008'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='permissions',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.TextField(choices=[('view_project', 'View project'), ('add_us', 'Add US'), ('comment_us', 'Comment US'), ('delete_us', 'Delete US'), ('modify_us', 'Modify US'), ('view_us', 'View US'), ('add_task', 'Add task'), ('comment_task', 'Comment task'), ('delete_task', 'Delete task'), ('modify_task', 'Modify task'), ('view_tasks', 'View tasks'), ('view_milestones', 'View milestones')]), blank=True, default=list, null=True, size=None, verbose_name='permissions'),
        ),
    ]