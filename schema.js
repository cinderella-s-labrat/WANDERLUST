const joi= require("joi");

const listingSchema= joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        image: joi.object({
            filename: joi.string().allow("", null),
            url: joi.string().allow("", null)
        }).allow("", null),
        location: joi.string().required(),
        price: joi.number().required().min(0),
        country: joi.string().required()
    }).required()
});

exports.listingSchema= listingSchema;

exports.reviewSchema= joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required(),
    }).required()
});