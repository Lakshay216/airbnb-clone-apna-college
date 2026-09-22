const { listingSchema, reviewSchema } = require('../schema.js');

describe('input validation', () => {
    test('accepts a valid listing', () => {
        const result = listingSchema.validate({
            listing: {
                title: 'Melbourne Apartment',
                description: 'A comfortable place to stay',
                location: 'Melbourne',
                country: 'Australia',
                price: 120,
                image: '',
            },
        });

        expect(result.error).toBeUndefined();
    });

    test('rejects a listing with a negative price', () => {
        const result = listingSchema.validate({
            listing: {
                title: 'Melbourne Apartment',
                description: 'A comfortable place to stay',
                location: 'Melbourne',
                country: 'Australia',
                price: -1,
            },
        });

        expect(result.error).toBeDefined();
    });

    test('accepts a review rating from one to five', () => {
        const result = reviewSchema.validate({
            review: { rating: 5, comment: 'Great stay' },
        });

        expect(result.error).toBeUndefined();
    });

    test('rejects an invalid review rating', () => {
        const result = reviewSchema.validate({
            review: { rating: 6, comment: 'Invalid rating' },
        });

        expect(result.error).toBeDefined();
    });
});
