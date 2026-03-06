const { ChargilyClient } = require('@chargily/chargily-pay');
require('dotenv').config({ path: 'c:/Users/niria/Desktop/manuva-project-connected/manuva-backend/.env' });

const client = new ChargilyClient({
  api_key: process.env.CHARGILY_APP_SECRET,
  mode: 'test',
});

async function test() {
  try {
    console.log('Testing Chargily API with secret key:', process.env.CHARGILY_APP_SECRET.substring(0, 10) + '...');
    const checkout = await client.createCheckout({
      amount: 100,
      currency: 'dzd',
      success_url: 'http://localhost:3000/success',
      failure_url: 'http://localhost:3000/failure',
      metadata: {
        order_id: 'test_order_123'
      },
    });
    console.log('Success! Checkout URL:', checkout.checkout_url);
    console.log('Metadata in response:', checkout.metadata);
  } catch (error) {
    console.error('Error testing Chargily API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

test();
