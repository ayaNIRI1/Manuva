const axios = require('axios');

async function testCategories() {
  try {
    const baseURL = 'http://localhost:3001/api';
    
    // Login as admin
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@manuva.com',
      password: 'admin'
    });
    const token = loginRes.data.token;
    console.log('Admin Login successful, token acquired.');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 1. Create a new category
    console.log('\\n--- Creating Category ---');
    const newCategoryName = '🧪 Test Category ' + Date.now();
    const createRes = await axios.post(`${baseURL}/admin/categories`, {
      name: newCategoryName,
      description: 'Used for automated testing'
    }, config);
    console.log('Create Response:', createRes.data);
    const categoryId = createRes.data.category.id;

    // 2. View approved categories
    console.log('\\n--- Fetching Approved Categories ---');
    const getRes = await axios.get(`${baseURL}/admin/categories/approved`, config);
    console.log(`Found ${getRes.data.length} approved categories.`);
    const found = getRes.data.find(c => c.id === categoryId);
    if (found && found.is_approved === true) {
      console.log('✅ Newly created category is in the approved list.');
    } else {
      console.log('❌ Newly created category NOT FAOUND or NOT APPROVED.');
    }

    // 3. Delete the category
    console.log('\\n--- Deleting Category ---');
    const delRes = await axios.delete(`${baseURL}/admin/categories/${categoryId}`, config);
    console.log('Delete Response:', delRes.data);
    console.log('✅ Test Completed Successfully.');

  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else {
      console.error('Test script error:', error.message);
    }
  }
}

testCategories();
