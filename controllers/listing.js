const Listing = require("../models/listing");

const fetch = require("node-fetch");

async function getCoordinates(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.length === 0) {
    console.log("Location not found");
    return null; // Return null instead of an empty array
  }

  return {
    type: "Point",
    coordinates: [parseFloat(data[0].lat), parseFloat(data[0].lon)], // Correct GeoJSON format
  };
}

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  // console.log(allListings);
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  console.log(req.user);
  res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not existed");
    res.redirect("/listings");
  }
  //   console.log("Listing Geometry:", listing.geometry);
  // console.log("Coordinates:", listing.geometry?.coordinates);

  // console.log(listing);
  res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  try {
    if (!req.body.listing) {
      throw new ExpressError(400, "Send valid data for listing");
    }

    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.file) {
      newListing.image = { url: req.file.path, filename: req.file.filename };
    }

    // Fetch coordinates
    const geoData = await getCoordinates(req.body.listing.location);
    if (!geoData) {
      throw new ExpressError(
        400,
        "Invalid location. Could not fetch coordinates."
      );
    }

    newListing.geometry = geoData; // Assign valid GeoJSON object

    let savedListing = await newListing.save(); // Save after validation
    console.log(savedListing);

    req.flash("success", "New Listing Created Successfully");
    res.redirect("/listings");
  } catch (error) {
    next(error);
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not existed");
    res.redirect("/listings");
  }
  let originalImg = listing.image.url;
  originalImg = originalImg.replace("/upload", "/upload/w_250");
  res.render("./listings/edit.ejs", { listing, originalImg });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  // await Listing.findByIdAndUpdate(id, req.body.listing, {
  //   new: true,
  // });

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Updated Successfully");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted Successfully");
  res.redirect("/listings");
};
