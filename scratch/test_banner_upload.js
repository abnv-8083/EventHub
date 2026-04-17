import fs from 'fs';

async function testUpload() {
    const form = new FormData();
    form.append('title', 'Test Banner Event');
    form.append('description', 'This is a test event for banner upload validation.');
    form.append('category', 'Technology');
    form.append('latitude', '10.0');
    form.append('longitude', '75.0');
    form.append('address', 'Test Address');
    form.append('startDate', '2026-05-01');
    form.append('startTime', '10:00');
    form.append('endDate', '2026-05-02');
    form.append('endTime', '18:00');
    form.append('visibility', 'Public');
    form.append('status', 'Pending');
    form.append('tags', JSON.stringify(['test', 'banner']));
    form.append('tickets[0][name]', 'General');
    form.append('tickets[0][price]', '100');
    form.append('tickets[0][availableSeats]', '50');
    form.append('tickets[0][maxPerUser]', '5');

    // Create a dummy image file
    const dummyImagePath = 'scratch/test_banner.png';
    fs.writeFileSync(dummyImagePath, 'dummy content');
    
    const blob = new Blob(['dummy content'], { type: 'image/png' });
    form.append('banner', blob, 'test_banner.png');

    try {
        const response = await fetch('http://localhost:5000/organizer/event/create', {
            method: 'POST',
            body: form,
            // With native Fetch and FormData, browser/node handles the boundary
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text.substring(0, 500));
    } catch (err) {
        console.error('Error:', err);
    }
}

testUpload();
