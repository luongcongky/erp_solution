async function testTranslationsApi() {
    try {
        console.log('Calling Translations API for locale "en"...');
        const response = await fetch('http://localhost:3000/api/translations/en', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': '1000',
                'x-stage-id': 'DEV'
            }
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2).substring(0, 1000));
    } catch (error) {
        console.error('Error calling API:', error);
    }
}

testTranslationsApi();
