const request = require('supertest');
const app = require('../app.js');

describe('application routes', () => {
    test('health endpoint reports that the application is running', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
    });

    test('readiness endpoint reports a disconnected test database', async () => {
        const response = await request(app).get('/ready');

        expect(response.status).toBe(503);
        expect(response.body.database).toBe('disconnected');
    });

    test('metrics endpoint exposes Prometheus-style counters', async () => {
        const response = await request(app).get('/metrics');

        expect(response.status).toBe(200);
        expect(response.text).toContain('airbnb_http_requests_total');
    });

    test('signup and login pages are available', async () => {
        const signup = await request(app).get('/signup');
        const login = await request(app).get('/login');

        expect(signup.status).toBe(200);
        expect(login.status).toBe(200);
    });

    test('an unauthenticated user is redirected from listing creation', async () => {
        const response = await request(app).post('/listings');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login');
    });

    test('an invalid listing ID returns a clear client error', async () => {
        const response = await request(app).get('/listings/not-a-valid-id');

        expect(response.status).toBe(400);
        expect(response.text).toContain('Invalid listing ID');
    });

    test('an unknown route returns the custom 404 page', async () => {
        const response = await request(app).get('/route-that-does-not-exist');

        expect(response.status).toBe(404);
        expect(response.text).toContain('PAGE NOT FOUND!');
    });
});
