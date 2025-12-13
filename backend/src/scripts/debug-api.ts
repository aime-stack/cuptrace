
import axios from 'axios';

async function checkApi() {
    try {
        console.log('--- LOGIN DEBUG ---');
        // Login to get token
        const loginRes = await axios.post('http://localhost:3001/auth/login', {
            email: 'admin@cuptrace.rw',
            password: 'admin123'
        });

        console.log('Login Response:', JSON.stringify(loginRes.data, null, 2));

        let token = '';
        if (loginRes.data.data && loginRes.data.data.token) {
            token = loginRes.data.data.token;
        } else if (loginRes.data.data && loginRes.data.data.accessToken) {
            token = loginRes.data.data.accessToken;
        } else if (loginRes.data.token) {
            token = loginRes.data.token;
        }

        if (!token) {
            console.error('CRITICAL: Could not find token in response.');
            return;
        }

        console.log('Got token:', token.substring(0, 10) + '...');

        console.log('\n--- COOPERATIVES DEBUG ---');
        // Call cooperatives
        const res = await axios.get('http://localhost:3001/cooperatives', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Response Status:', res.status);
        console.log('Response Keys:', Object.keys(res.data));

        if (res.data.data) {
            console.log('Data Type:', Array.isArray(res.data.data) ? 'Array' : typeof res.data.data);
            if (Array.isArray(res.data.data)) {
                console.log('Array Length:', res.data.data.length);
                if (res.data.data.length > 0) {
                    console.log('First Item:', JSON.stringify(res.data.data[0], null, 2));
                }
            } else {
                console.log('Data Content:', JSON.stringify(res.data.data, null, 2));
            }
        } else {
            console.log('No data property found.');
        }

    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

checkApi();
