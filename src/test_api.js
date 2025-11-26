async function testApi() {
    try {
        console.log('Calling API...');
        const response = await fetch('http://localhost:3000/api/audit-logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'CREATE',
                module: 'USERS'
            }),
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error calling API:', error);
    }
}

testApi();
