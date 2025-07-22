from rest_framework import serializers
from .models import ProductOwner

class ProductOwnerSerializer(serializers.ModelSerializer):
    model = ProductOwner
    fields = ['id','name']