const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: {
        type: String,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    //listing name is used to reference the listing to which the review belongs
    //self-added
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing"
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model ("Review", reviewSchema);