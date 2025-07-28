from rest_framework import serializers
from .models import Feedbacks
from client.serializers import ClientSerializer
from client.models import Client
from accounts.models import User

class FeedbackCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de feedback avec gestion flexible des IDs"""
    
    class Meta:
        model = Feedbacks
        fields = '__all__'
    
    def validate_client(self, value):
        """
        Gestion flexible des IDs client :
        - Accepte les entiers directs
        - Accepte les strings convertibles en entiers
        - Cherche par user_id si l'ID direct ne fonctionne pas
        """
        print(f"🔍 Validation client ID: {value} (type: {type(value)})")
        
        # Cas 1: Déjà une instance Client
        if isinstance(value, Client):
            print(f"✅ Instance Client directe: {value.id}")
            return value
        
        # Cas 2: ID numérique direct
        if isinstance(value, int):
            try:
                client = Client.objects.get(id=value)
                print(f"✅ Client trouvé par ID numérique: {client.id}")
                return client
            except Client.DoesNotExist:
                print(f"❌ Aucun client avec l'ID: {value}")
                raise serializers.ValidationError(f"Client avec l'ID {value} introuvable.")
        
        # Cas 3: String à convertir
        if isinstance(value, str):
            # Essayer conversion en entier
            try:
                client_id = int(value)
                client = Client.objects.get(id=client_id)
                print(f"✅ Client trouvé par conversion string->int: {client.id}")
                return client
            except (ValueError, Client.DoesNotExist):
                print(f"❌ Conversion échouée ou client introuvable: {value}")
                
                # Essayer de trouver par user_id (si le modèle Client a cette relation)
                try:
                    # Supposons que Client a une FK vers User
                    if hasattr(Client, 'user') or hasattr(Client, 'user_id'):
                        # Chercher par user_id string
                        user = User.objects.get(id=value)  # Si User utilise des UUIDs
                        client = Client.objects.get(user=user)
                        print(f"✅ Client trouvé via User: {client.id}")
                        return client
                except (User.DoesNotExist, Client.DoesNotExist, ValueError):
                    print(f"❌ Aucune correspondance User->Client pour: {value}")
                    pass
        
        print(f"❌ Impossible de résoudre le client ID: {value}")
        raise serializers.ValidationError(f"Format d'ID client invalide: {value}")

    def create(self, validated_data):
        """Override create pour debug"""
        print("📝 Création feedback avec données validées:")
        for key, value in validated_data.items():
            print(f"  {key}: {value} (type: {type(value)})")
        
        return super().create(validated_data)