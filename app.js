const express= require('express');
const app= express();
const mongoose= require('mongoose');
const Listing= require('./models/listing.js');
const path= require('path');
const methodOverride= require('method-override');
const ejsMate= require('ejs-mate');
const wrapAsync= require('./public/utils/wrapAsync.js');
const ExpressError= require('./public/js/ExpressError.js');
const { listingSchema, reviewSchema }= require('./schema.js');
const Review= require('./models/reviews.js');

//db name wanderlust
const MONGO_URI= "mongodb://127.0.0.1:27017/Wanderlust";

main()
    .then(()=> {
        console.log("Connected to MongoDB")
    })
    .catch((err)=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect(MONGO_URI);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public"))),

app.get("/", (req, res)=>{
    res.send("Hi, I am root");
});
//validation middleware
const ValidateListing=  (req, res, next)=>{
        let {error}= listingSchema.validate(req.body);
        if(error){
            let errMsg= error.details.map(el=> el.message).join(",");
            throw new ExpressError(400, errMsg);
        } else {
            next();
        }
}

const ValidateReview = (req, res, next)=>{
    let {error}= reviewSchema.validate(req.body);
    if(error){
        let errMsg= error.details.map(el=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
            next();
        }
}


//index route to show all listings
app.get("/listings", wrapAsync(async (req, res)=>{
    const allListings= await Listing.find({});
    //console.log(allListings);
    res.render("listings/index.ejs", {allListings});
}));

//create new route to create a new listing
app.get("/listings/new", wrapAsync(async (req, res)=>{
    res.render("listings/new.ejs");
}));

//edit
app.get("/listings/:id/edit", wrapAsync(async(req, res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id);
    res.render("listings/edit.ejs", { listing })
}));

//show route to show a single listing
app.get("/listings/:id", wrapAsync(async (req, res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id).populate("reviews");
    if(!listing){
        throw new ExpressError(404, "Listing Not Found");
    }
    res.render("listings/show.ejs", {listing});
}));

//create post route
app.post("/listings", ValidateListing, wrapAsync(async (req, res, next)=>{
        const newListing= new Listing(req.body.listing);
        await newListing.save();
         console.log("5. LISTING SAVED TO MONGODB");
        res.redirect("/listings");
    })
);

//update route
app.put("/listings/:id",ValidateListing, wrapAsync(async(req, res)=>{
    let { id }= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id", wrapAsync(async (req, res)=>{
    let { id }= req.params;
    let deletedItem= await Listing.findByIdAndDelete(id);
    console.warn(`Deleted item: ${deletedItem}`);
    res.redirect(`/listings`);
}));

//review post route
app.post("/listings/:id/reviews", ValidateReview, wrapAsync(async(req, res)=>{
    let listing= await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review);
    newReview.listing = listing._id; // Associate the review with the listing
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("Review saved to MongoDB");
    
    res.redirect(`/listings/${listing._id}`);
}));

//delete review route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req, res)=>{
    let {id, reviewId}= req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

//error handling for invalid routes
app.all("/*splat", (req, res, next)=> {
    next (new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next)=>{
    let {statusCode= 500, message= "Something went wrong"}= err;
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, ()=>{
    console.log('Server is running on port 8080');
});