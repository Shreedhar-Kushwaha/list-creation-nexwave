import axios from 'axios';

export const fetchListData = async () => {
  try {
    // const response = await axios.get('https://api.example.com/list'); // Replace with actual API
    const response = await axios.get('https://apis.ccbp.in/list-creation/lists');
    return response.data;
  } catch (error) {
    throw error;
  }
};