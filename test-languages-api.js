async function testLanguagesApi() {
    try {
        console.log('Calling Languages API...');
        const response = await fetch('http://localhost:3000/api/languages', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': '1000',
                'x-stage-id': 'DEV'
            }
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error calling API:', error);
    }
}

testLanguagesApi();
