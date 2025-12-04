// Simple test to check if server is responding at all
async function testHealthCheck() {
    try {
        console.log('Testing server health...');
        const response = await fetch('http://localhost:3000/', {
            method: 'GET'
        });
        console.log('Server status:', response.status);
        if (response.status === 200) {
            console.log('✅ Server is responding');
        } else {
            console.log('❌ Server returned:', response.status);
        }
    } catch (error) {
        console.error('❌ Server not reachable:', error.message);
    }
}

testHealthCheck();
