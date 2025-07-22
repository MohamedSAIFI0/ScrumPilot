"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/',include('feedbacks.urls')),
    path('api/',include('projects.urls')),
    path('api/',include('retrospective.urls')),
    path('api/',include('team.urls')),
    path('api/',include('sprints.urls')),
    path('api/',include('userstory.urls')),
    path('api/',include('blocage.urls')),
    path('api/',include('epic.urls')),
    path('api/',include('profil.urls')),
    path('api/',include('scrum_master.urls')),
    path('api/',include('product_owner.urls')),
    path('api/',include('client.urls')),
    path('api/',include('dev.urls')),
    path('api/',include('contact.urls')),
]
