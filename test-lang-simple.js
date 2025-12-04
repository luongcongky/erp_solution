async function testLanguagesApi() {
    try {
        console.log('Testing Languages API...');
        const response = await fetch('http://localhost:3000/api/languages', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': '1000',
                'x-stage-id': 'DEV'
            }
        });

        console.log('Status:', response.status);
        if (response.status === 200) {
            const data = await response.json();
            console.log('✅ Languages API works!');
            console.log('Data:', JSON.stringify(data, null, 2).substring(0, 500));
        } else {
            const text = await response.text();
            console.log('❌ Languages API failed');
            console.log('Response:', text.substring(0, 500));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLanguagesApi();
