from django.urls import path
from . import views

urlpatterns = [
    # Vos URLs...
    path('login/', views.LoginView.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('create-user/', views.CreateUserView.as_view(), name='create-user'),
    path('current-user/', views.CurrentUserView.as_view(), name='current-user'),
    path('role-protected/', views.RoleProtectedView.as_view(), name='role-protected'),
    
    # 📝 URLs pour la modification d'utilisateur
    path('users/update/', views.UpdateUserView.as_view(), name='update-current-user'),
    path('users/update/<str:email>/', views.UpdateUserView.as_view(), name='update-user-by-email'),
    
    # 👥 URLs pour récupérer les informations des utilisateurs
    path('users/', views.UsersListView.as_view(), name='users-list'),
    path('users/<str:email>/', views.UserDetailView.as_view(), name='user-detail'),

    path('users/delete/<str:email>/', views.DeleteUserView.as_view(), name='delete-user'),

    path('current-user/', views.CurrentUserView.as_view(), name='current-user'),

]