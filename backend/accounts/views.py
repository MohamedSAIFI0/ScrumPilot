from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import User
from .serializers import RegisterUserSerializer, UserSerializer, UpdateUserSerializer

# 🔐 Login avec JWT
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"detail": "Email et mot de passe requis"}, status=400)

        user = authenticate(request, email=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'email': user.email,
                'role': user.role,
                'name': user.name,
            }, status=200)
        return Response({"detail": "Identifiants invalides ❌"}, status=401)
    

# ✅ Inscription publique (accessible à tous)
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Optionnel: connecter automatiquement l'utilisateur après inscription
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Utilisateur créé avec succès ✅',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'email': user.email,
                'role': user.role,
                'name': user.name,
            }, status=201)
        return Response(serializer.errors, status=400)


# ✅ Créer un utilisateur (réservé à l'admin)
class CreateUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Vérifier si l'utilisateur est authentifié
        if not request.user.is_authenticated:
            return Response({
                "error": "Authentification requise pour créer un utilisateur"
            }, status=401)
            
        # Vérifier si l'utilisateur a le rôle admin
        if request.user.role != "ADMIN":
            return Response({
                "error": "Seuls les administrateurs peuvent créer des utilisateurs"
            }, status=403)
            
        serializer = RegisterUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Utilisateur créé par admin ✅',
                'user': UserSerializer(user).data
            }, status=201)
        return Response(serializer.errors, status=400)


# ✏️ Modifier les informations d'un utilisateur
class UpdateUserView(APIView):
    #permission_classes = [permissions.IsAuthenticated]

    def put(self, request, email=None):
        # Si email n'est pas fourni, modifier l'utilisateur connecté
        if email is None:
            user = request.user
        else:
            # Récupérer l'utilisateur par email
            user = get_object_or_404(User, email=email)
        
        # Utiliser directement les données de la requête
        data = request.data
        
        serializer = UpdateUserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            return Response({
                'message': 'Utilisateur modifié avec succès ✅',
                'user': UserSerializer(updated_user).data
            }, status=200)
        return Response(serializer.errors, status=400)

    def patch(self, request, email=None):
        # PATCH fonctionne comme PUT mais explicitement pour les mises à jour partielles
        return self.put(request, email)


# 🔐 Exemple de vue protégée par rôle
class RoleProtectedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role == "PO":
            return Response({"message": "Bienvenue Product Owner ✅"}, status=200)
        return Response({"error": "Accès interdit : rôle non autorisé"}, status=403)


# 👤 Récupérer les infos de l'utilisateur connecté
class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# 👥 Récupérer la liste de tous les utilisateurs
class UsersListView(APIView):
    #permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = User.objects.all().order_by('-created_at')
        serializer = UserSerializer(users, many=True)
        return Response({
            'message': 'Liste des utilisateurs récupérée avec succès ✅',
            'count': users.count(),
            'users': serializer.data
        }, status=200)


# 👤 Récupérer les informations d'un utilisateur spécifique par email
class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, email):
        user = get_object_or_404(User, email=email)
        serializer = UserSerializer(user)
        return Response({
            'message': 'Informations utilisateur récupérées avec succès ✅',
            'user': serializer.data
        }, status=200)


#  Supprimer un utilisateur par email (réservé aux administrateurs)
class DeleteUserView(APIView):
    #permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, email):
        # Vérification de rôle
        #if request.user.role != "ADMIN":
         #   return Response({
          #      "error": "Seuls les administrateurs peuvent supprimer des utilisateurs"
           # }, status=403)

        # Vérifier si l'utilisateur existe
        user = get_object_or_404(User, email=email)

        # Protection optionnelle : ne pas permettre à un admin de se supprimer lui-même
        if user == request.user:
            return Response({
                "error": "Vous ne pouvez pas vous supprimer vous-même"
            }, status=400)

        user.delete()
        return Response({
            "message": f"L'utilisateur avec l'email {email} a été supprimé avec succès ✅"
        }, status=200)
