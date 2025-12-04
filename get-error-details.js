async function getDetailedError() {
    try {
        console.log('Getting detailed error from Roles API...');
        const response = await fetch('http://localhost:3000/api/roles', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': '1000',
                'x-stage-id': 'DEV'
            }
        });

        const text = await response.text();
        console.log('Status:', response.status);

        // Try to extract error message from HTML
        const titleMatch = text.match(/<title>(.*?)<\/title>/);
        if (titleMatch) {
            console.log('Error title:', titleMatch[1]);
        }

        // Look for error details
        const errorMatch = text.match(/Error: (.*?)(?:<|$)/);
        if (errorMatch) {
            console.log('Error message:', errorMatch[1]);
        }

        // Save full HTML for inspection
        const fs = await import('fs');
        fs.writeFileSync('error-page.html', text);
        console.log('Full error saved to error-page.html');

    } catch (error) {
        console.error('Failed:', error.message);
    }
}

getDetailedError();
