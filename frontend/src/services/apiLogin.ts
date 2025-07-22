import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login/`, {
    email,
    password
  });

  const { access, refresh, email: userEmail, role, name } = response.data;

  // Stocker les tokens et les infos utilisateur dans localStorage
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  localStorage.setItem('user', JSON.stringify({ email: userEmail, role, name }));

  return { role }; // On retourne le rôle pour la redirection
};


export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};



