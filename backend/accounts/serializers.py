from rest_framework import serializers
from .models import User
from client.models import Client
from product_owner.models import ProductOwner
from scrum_master.models import ScrumMaster
from dev.models import Dev
from profil.models import Profil

# Serializer pour l'enregistrement d'utilisateur (inscription)
from rest_framework import serializers
from .models import User
from client.models import Client
from profil.serializers import ProfilSerializer

class RegisterUserSerializer(serializers.ModelSerializer):
    profil = ProfilSerializer(required=False)  # Champ profil imbriqué

    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'role', 'team', 'avatar', 'status', 'created_at', 'last_login', 'profil']  # ✅ ajout de 'profil'
        extra_kwargs = {
            'password': {'write_only': True},
            'avatar': {'required': False},
            'team': {'required': False},
            'status': {'required': False},
        }

    def create(self, validated_data):
        profil_data = validated_data.pop('profil', {})  # Extraire les données du profil
        role = validated_data.get('role')

        if role == 'CLIENT':
            client = Client.objects.create_user(**validated_data)
            Profil.objects.update_or_create(user=client, defaults=profil_data)
            return client

        elif role == 'PO':
            po = ProductOwner.objects.create_user(**validated_data)
            Profil.objects.update_or_create(user=po, defaults=profil_data)
            return po

        elif role == 'SM':
            sm = ScrumMaster.objects.create_user(**validated_data)
            Profil.objects.update_or_create(user=sm, defaults=profil_data)
            return sm

        elif role == 'DEV':
            dev = Dev.objects.create_user(**validated_data)
            Profil.objects.update_or_create(user=dev, defaults=profil_data)
            return dev

        else:
            user = User.objects.create_user(**validated_data)
            Profil.objects.update_or_create(user=user, defaults=profil_data)
            return user



#  Serializer pour afficher les infos utilisateur (lecture)
class UserSerializer(serializers.ModelSerializer):
    # Utiliser SerializerMethodField pour convertir en camelCase
    createdAt = serializers.SerializerMethodField()
    lastLogin = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'name',
            'role',
            'status',
            'team',
            'avatar',
            'createdAt',  # camelCase
            'lastLogin'   # camelCase
        ]
        read_only_fields = ['status', 'createdAt', 'lastLogin']
    
    def get_createdAt(self, obj):
        return obj.created_at.isoformat() if obj.created_at else None
    
    def get_lastLogin(self, obj):
        return obj.last_login.isoformat() if obj.last_login else None

#  Serializer pour la modification d'utilisateur
class UpdateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'email',
            'name',
            'role',
            'team',
            'avatar',
            'status',
            'password'
        ]
        extra_kwargs = {
            'email': {'required': False},
            'name': {'required': False},
            'role': {'required': False},
            'team': {'required': False},
            'avatar': {'required': False},
            'status': {'required': False},
        }

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance