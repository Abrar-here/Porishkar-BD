import RecyclingCentre from "../models/RecyclingCentre.js";

const VALID_MATERIALS = [
  "Plastic",
  "Paper",
  "Metal",
  "Glass",
  "Electronic Waste",
  "Textile",
];

// Helper: calculate distance between two coordinates in km (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Helper: check if a centre is currently open, based on its hours.
// Returns false (not true) on any malformed/missing data, so a bad
// record never crashes the request — it just shows as closed.
const isOpenNow = (hours) => {
  if (!hours || !hours.open || !hours.close) return false;

  const parseTime = (timeStr) => {
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };

  const openMinutes = parseTime(hours.open);
  const closeMinutes = parseTime(hours.close);
  if (openMinutes === null || closeMinutes === null) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

// @desc    Get all active recycling centres (with optional material filter + proximity sort)
// @route   GET /api/centres
// @access  Public
export const getAllCentres = async (req, res) => {
  try {
    const { material, lat, lng } = req.query;

    // Build filter — always only show active centres
    const filter = { isActive: true };

    // If material filter provided, only return centres that accept it
    if (material) {
      filter.acceptedMaterials = { $in: [material] };
    }

    let centres = await RecyclingCentre.find(filter);

    // Add distance, isOpen, and reviews (newest first) to each centre
    centres = centres.map((centre) => {
      const centreObj = centre.toObject();
      centreObj.isOpen = isOpenNow(centre.hours);
      centreObj.reviews = [...(centre.reviews || [])].reverse();

      // If user's coordinates provided, calculate real distance
      if (lat && lng) {
        centreObj.distance = parseFloat(
          calculateDistance(
            parseFloat(lat),
            parseFloat(lng),
            centre.location.lat,
            centre.location.lng,
          ).toFixed(2),
        );
      } else {
        centreObj.distance = null;
      }

      return centreObj;
    });

    // Sort by proximity if coordinates provided, otherwise by name
    if (lat && lng) {
      centres.sort((a, b) => a.distance - b.distance);
    } else {
      centres.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.status(200).json({ centres });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a single centre by ID
// @route   GET /api/centres/:id
// @access  Public
export const getCentreById = async (req, res) => {
  try {
    const centre = await RecyclingCentre.findById(req.params.id);

    if (!centre || !centre.isActive) {
      return res.status(404).json({ message: "Recycling centre not found" });
    }

    const centreObj = centre.toObject();
    centreObj.isOpen = isOpenNow(centre.hours);
    centreObj.reviews = [...(centre.reviews || [])].reverse();

    res.status(200).json({ centre: centreObj });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add a new recycling centre (admin only)
// @route   POST /api/centres
// @access  Private (admin)
export const addCentre = async (req, res) => {
  try {
    const { name, address, location, acceptedMaterials, hours, phone } =
      req.body;

    if (!name || !address || !location || !acceptedMaterials) {
      return res.status(400).json({
        message: "Name, address, location, and accepted materials are required",
      });
    }

    if (!location.lat || !location.lng) {
      return res.status(400).json({
        message: "Location must include lat and lng",
      });
    }

    if (!Array.isArray(acceptedMaterials) || acceptedMaterials.length === 0) {
      return res.status(400).json({
        message: "At least one accepted material is required",
      });
    }

    // Reject unknown material values before they ever reach Mongoose,
    // so the citizen/admin gets a clear message instead of a raw
    // validation error.
    const invalidMaterials = acceptedMaterials.filter(
      (m) => !VALID_MATERIALS.includes(m),
    );
    if (invalidMaterials.length > 0) {
      return res.status(400).json({
        message: `Invalid material type(s): ${invalidMaterials.join(", ")}. Must be one of: ${VALID_MATERIALS.join(", ")}`,
      });
    }

    const centre = await RecyclingCentre.create({
      name,
      address,
      location,
      acceptedMaterials,
      hours: hours || { open: "9:00 AM", close: "6:00 PM" },
      phone: phone || null,
    });

    res.status(201).json({
      message: "Recycling centre added successfully",
      centre,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a recycling centre (admin only)
// @route   PUT /api/centres/:id
// @access  Private (admin)
export const updateCentre = async (req, res) => {
  try {
    const centre = await RecyclingCentre.findById(req.params.id);

    if (!centre) {
      return res.status(404).json({ message: "Recycling centre not found" });
    }

    // Same validation as addCentre, applied only if acceptedMaterials
    // is actually part of this update.
    if (req.body.acceptedMaterials) {
      const invalidMaterials = req.body.acceptedMaterials.filter(
        (m) => !VALID_MATERIALS.includes(m),
      );
      if (invalidMaterials.length > 0) {
        return res.status(400).json({
          message: `Invalid material type(s): ${invalidMaterials.join(", ")}`,
        });
      }
    }

    const updated = await RecyclingCentre.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      message: "Recycling centre updated successfully",
      centre: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Deactivate a centre (soft delete — admin only)
// @route   DELETE /api/centres/:id
// @access  Private (admin)
export const deleteCentre = async (req, res) => {
  try {
    const centre = await RecyclingCentre.findById(req.params.id);

    if (!centre) {
      return res.status(404).json({ message: "Recycling centre not found" });
    }

    centre.isActive = false;
    await centre.save();

    res
      .status(200)
      .json({ message: "Recycling centre deactivated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Submit a rating + optional written review for a centre
//          (citizen, once per centre)
// @route   POST /api/centres/:id/rate
// @access  Private (citizen)
export const rateCentre = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be a number between 1 and 5",
      });
    }

    if (comment && comment.length > 500) {
      return res.status(400).json({
        message: "Comment must be 500 characters or fewer",
      });
    }

    const centre = await RecyclingCentre.findById(req.params.id);

    if (!centre || !centre.isActive) {
      return res.status(404).json({ message: "Recycling centre not found" });
    }

    const alreadyRated = centre.reviews.some(
      (review) => review.ratedBy.toString() === req.user._id.toString(),
    );
    if (alreadyRated) {
      return res.status(400).json({
        message: "You have already rated this centre",
      });
    }

    centre.reviews.push({
      ratedBy: req.user._id,
      rating,
      comment: comment ? comment.trim() : "",
      reviewerName: req.user.name,
    });
    await centre.save();

    res.status(200).json({
      message: "Review submitted successfully",
      averageRating: centre.averageRating,
      totalRatings: centre.totalRatings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all reviews for a centre (newest first)
// @route   GET /api/centres/:id/reviews
// @access  Public
export const getCentreReviews = async (req, res) => {
  try {
    const centre = await RecyclingCentre.findById(req.params.id).select(
      "reviews isActive",
    );

    if (!centre || !centre.isActive) {
      return res.status(404).json({ message: "Recycling centre not found" });
    }

    const reviews = [...centre.reviews].reverse();

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
