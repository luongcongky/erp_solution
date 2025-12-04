async function testRolesApi() {
    try {
        console.log('Testing Roles API...');
        const response = await fetch('http://localhost:3000/api/roles', {
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
            console.log('✅ Roles API works!');
        } else {
            console.log('❌ Roles API failed');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testRolesApi();
