jest.mock('../models/listing.js', () => ({
    findById: jest.fn(),
}));

jest.mock('../models/review.js', () => ({
    findById: jest.fn(),
}));

const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const {
    isLoggedIn,
    isOwned,
    isOwned_review,
    validatelisting,
} = require('../middleware.js');

function makeResponse() {
    return {
        redirect: jest.fn(),
    };
}

describe('authentication and authorisation middleware', () => {
    test('redirects a user who is not logged in', () => {
        const req = {
            isAuthenticated: () => false,
            originalUrl: '/listings/new',
            session: {},
            flash: jest.fn(),
        };
        const res = makeResponse();
        const next = jest.fn();

        isLoggedIn(req, res, next);

        expect(req.session.redirectUrl).toBe('/listings/new');
        expect(res.redirect).toHaveBeenCalledWith('/login');
        expect(next).not.toHaveBeenCalled();
    });

    test('allows the listing owner to continue', async () => {
        const userId = '507f1f77bcf86cd799439011';
        Listing.findById.mockResolvedValue({
            owner: { equals: (value) => value === userId },
        });
        const req = { params: { id: userId }, user: { _id: userId }, flash: jest.fn() };
        const res = makeResponse();
        const next = jest.fn();

        await isOwned(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    test('redirects a user who does not own the listing', async () => {
        Listing.findById.mockResolvedValue({ owner: { equals: () => false } });
        const req = {
            params: { id: '507f1f77bcf86cd799439011' },
            user: { _id: '507f1f77bcf86cd799439012' },
            flash: jest.fn(),
        };
        const res = makeResponse();
        const next = jest.fn();

        await isOwned(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith('/listings/507f1f77bcf86cd799439011');
        expect(next).not.toHaveBeenCalled();
    });

    test('allows the review author to continue', async () => {
        const userId = '507f1f77bcf86cd799439011';
        Review.findById.mockResolvedValue({
            author: { equals: (value) => value === userId },
        });
        const req = {
            params: { id: '507f1f77bcf86cd799439013', reviewId: '507f1f77bcf86cd799439014' },
            user: { _id: userId },
            flash: jest.fn(),
        };
        const res = makeResponse();
        const next = jest.fn();

        await isOwned_review(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    test('rejects invalid listing input', () => {
        const req = { body: { listing: { title: 'Incomplete listing' } } };
        const next = jest.fn();

        validatelisting(req, {}, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
    });
});
