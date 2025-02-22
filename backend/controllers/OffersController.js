const Offers = require("../models/Offers")  


exports.createOffer = async (req, res) => {
  try {
    const offerData = req.body;
    const newOffer = new Offers(offerData);
    await newOffer.save();

    res.status(201).json({
      message: "Offer created successfully",
      offer: newOffer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating offer", error });
  }
};


exports.updateOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const updatedData = req.body;
    const updatedOffer = await Offers.findByIdAndUpdate(offerId, updatedData, { new: true });

    if (!updatedOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({
      message: "Offer updated successfully",
      offer: updatedOffer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating offer", error });
  }
};

exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offers.find();  
    res.status(200).json({ offers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching offers", error });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const deletedOffer = await Offers.findByIdAndDelete(offerId);

    if (!deletedOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({
      message: "Offer deleted successfully",
      offer: deletedOffer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting offer", error });
  }
};

