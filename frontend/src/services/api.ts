export interface Feedback {
    id: string;
    author: string;
    content: string;
    rating: number;
    timestamp: string;
    deliverableId?: string;
}

const BASE_URL = 'http://127.0.0.1:8000/api/';

export const getAuthHeaders = () => {
    const access = localStorage.getItem('access');
    return access ? { Authorization: `Bearer ${access}` } : {};
};

// --- Endpoints adaptés aux routes Django ---
const endpoints = {
    feedbackList: 'feedback/',
    feedbackCreate: 'feedback/create',
    projects: 'projects/',
    sprints: 'sprints/',
    userstories: 'userstories/',
    teams: 'teams/',
    retrospectives: 'retrospectives/',
    epics: 'epics/',
    blocages: 'blocages/',
};

// --- API Functions ---
export const fetchFeedbacks = async () => {
    const response = await fetch(`${BASE_URL}${endpoints.feedbackList}`, {
        headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error(`Failed to fetch feedbacks`);
    return response.json();
};

export const createFeedback = async (data: any) => {
    const response = await fetch(`${BASE_URL}${endpoints.feedbackCreate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to create feedback`);
    return response.json();
};

// --- Pour les autres ressources qui suivent le CRUD standard ---
export const fetchList = async (resource: keyof typeof endpoints) => {
    const response = await fetch(`${BASE_URL}${endpoints[resource]}`, {
        headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error(`Failed to fetch ${resource}`);
    return response.json();
};

export const fetchDetail = async (resource: keyof typeof endpoints, id: string | number) => {
    const response = await fetch(`${BASE_URL}${endpoints[resource]}${id}/`, {
        headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error(`Failed to fetch ${resource} detail`);
    return response.json();
};

export const createItem = async (resource: keyof typeof endpoints, data: any) => {
    const response = await fetch(`${BASE_URL}${endpoints[resource]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to create ${resource}`);
    return response.json();
};

export const updateItem = async (resource: keyof typeof endpoints, id: string | number, data: any) => {
    const response = await fetch(`${BASE_URL}${endpoints[resource]}${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to update ${resource}`);
    return response.json();
};

export const deleteItem = async (resource: keyof typeof endpoints, id: string | number) => {
    const response = await fetch(`${BASE_URL}${endpoints[resource]}${id}/`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error(`Failed to delete ${resource}`);
    return true;
};
