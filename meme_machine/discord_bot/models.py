from django.db import models

# Create your models here.
class Response(models.Model):
    call = models.CharField(max_length=1000)
    response = models.CharField(max_length=1000)

