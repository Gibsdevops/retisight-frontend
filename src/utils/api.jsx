import axios from 'axios';

const BACKEND_URL = "https://gibsdevops-retisight-api.hf.space";

export const predictDR = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${BACKEND_URL}/predict`, formData);
    return response.data;
};