const mongoose= require('mongoose');
const Schema= mongoose.Schema;
const Review= require("./reviews.js");

const listingSchema= new Schema({
    title:
    {
        type:String,
        required:true,
    },
    description:String,
   image: {
    filename: {
        type: String,
        default: "listingimage",
    },
    url: {
        type: String,
        default:
            "https://images.unsplash.com/photo-1606145456629-986a60d19da9?q=80&w=1170&auto=format&fit=crop",
        set: (v) =>
            v === ""
                ? "https://images.unsplash.com/photo-1672739172700-cfe39912624c?q=80&w=1170&auto=format&fit=crop"
                : v,
    },
},
    price:Number,
    location:String,
    country:String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ]
});

//creating middleware for deleting reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

//creating a db schema name Listing
const Listing= mongoose.model("Listing", listingSchema);

module.exports= Listing;