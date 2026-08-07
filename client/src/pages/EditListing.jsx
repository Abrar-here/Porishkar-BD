import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    materialType: "",
    quantityValue: "",
    quantityUnit: "kg",
    condition: "",
    listingType: "Sale",
    askingPrice: "",
    fullAddress: "",
    district: "",
    division: "",
  });

  // Images already saved in MongoDB / Cloudinary
  const [existingImages, setExistingImages] = useState([]);

  // New images selected from computer
  const [newImages, setNewImages] = useState([]);

  // Cloudinary public IDs that should be removed
  const [removedImages, setRemovedImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);

        const listing = res.data.listing;

        setForm({
          title: listing.title || "",
          description: listing.description || "",
          materialType: listing.materialType || "",
          quantityValue: listing.quantity?.value || "",
          quantityUnit: listing.quantity?.unit || "kg",
          condition: listing.condition || "",
          listingType: listing.listingType || "Sale",
          askingPrice: listing.askingPrice ?? "",
          fullAddress: listing.pickupAddress?.fullAddress || "",
          district: listing.pickupAddress?.district || "",
          division: listing.pickupAddress?.division || "",
        });

        setExistingImages(listing.images || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load listing"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If listing changes to Donation,
    // asking price is no longer needed
    if (name === "listingType" && value === "Donation") {
      setForm({
        ...form,
        listingType: value,
        askingPrice: "",
      });

      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };

  // Add new images
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const currentImageCount =
      existingImages.length + newImages.length;

    if (currentImageCount + selectedFiles.length > 4) {
      setError(
        `A listing can have maximum 4 images. You currently have ${currentImageCount}.`
      );

      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    const invalidFile = selectedFiles.find(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidFile) {
      setError(
        "Only JPG, JPEG, PNG and WebP images are allowed."
      );

      e.target.value = "";
      return;
    }

    const largeFile = selectedFiles.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (largeFile) {
      setError(
        "Each image must be smaller than 5 MB."
      );

      e.target.value = "";
      return;
    }

    setError("");

    setNewImages((currentImages) => [
      ...currentImages,
      ...selectedFiles,
    ]);

    e.target.value = "";
  };

  // Remove an existing Cloudinary image
  const removeExistingImage = (image) => {
    setExistingImages((currentImages) =>
      currentImages.filter(
        (currentImage) =>
          currentImage.publicId !== image.publicId
      )
    );

    if (image.publicId) {
      setRemovedImages((currentRemovedImages) => [
        ...currentRemovedImages,
        image.publicId,
      ]);
    }
  };

  // Remove a newly selected image
  const removeNewImage = (index) => {
    setNewImages((currentImages) =>
      currentImages.filter(
        (_, imageIndex) => imageIndex !== index
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();

      // Normal listing fields
      formData.append("title", form.title);
      formData.append(
        "description",
        form.description
      );
      formData.append(
        "materialType",
        form.materialType
      );
      formData.append(
        "quantityValue",
        form.quantityValue
      );
      formData.append(
        "quantityUnit",
        form.quantityUnit
      );
      formData.append(
        "condition",
        form.condition
      );
      formData.append(
        "listingType",
        form.listingType
      );

      if (form.listingType === "Sale") {
        formData.append(
          "askingPrice",
          form.askingPrice
        );
      }

      formData.append(
        "fullAddress",
        form.fullAddress
      );
      formData.append(
        "district",
        form.district
      );
      formData.append(
        "division",
        form.division
      );

      // Tell backend which old images to remove
      removedImages.forEach((publicId) => {
        formData.append(
          "removeImages",
          publicId
        );
      });

      // Add newly selected images
      newImages.forEach((image) => {
        formData.append("images", image);
      });

      await api.patch(
        `/listings/${id}`,
        formData
      );

      navigate("/my-listings");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update listing"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">
          Loading listing...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Edit Listing
          </h1>

          <p className="text-gray-500 mt-2">
            Update your listing information and images.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Title */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Listing Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Material */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Material Type
            </label>

            <select
              name="materialType"
              value={form.materialType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">
                Select material
              </option>

              <option value="Plastic">
                Plastic
              </option>

              <option value="Paper">
                Paper
              </option>

              <option value="Metal">
                Metal
              </option>

              <option value="Glass">
                Glass
              </option>

              <option value="Electronic Waste">
                Electronic Waste
              </option>

              <option value="Textile">
                Textile
              </option>
            </select>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Quantity
              </label>

              <input
                type="number"
                name="quantityValue"
                value={form.quantityValue}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Unit
              </label>

              <select
                name="quantityUnit"
                value={form.quantityUnit}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
              >
                <option value="kg">
                  kg
                </option>

                <option value="ton">
                  ton
                </option>

                <option value="piece">
                  piece
                </option>

                <option value="bag">
                  bag
                </option>
              </select>
            </div>

          </div>

          {/* Condition */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Condition
            </label>

            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">
                Select condition
              </option>

              <option value="Clean">
                Clean
              </option>

              <option value="Soiled">
                Soiled
              </option>

              <option value="Mixed">
                Mixed
              </option>
            </select>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Listing Type
            </label>

            <select
              name="listingType"
              value={form.listingType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
            >
              <option value="Sale">
                Sale
              </option>

              <option value="Donation">
                Donation
              </option>
            </select>
          </div>

          {/* Asking Price */}
          {form.listingType === "Sale" && (
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Asking Price (৳)
              </label>

              <input
                type="number"
                name="askingPrice"
                value={form.askingPrice}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {/* Pickup Address */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Pickup Address
            </label>

            <input
              type="text"
              name="fullAddress"
              value={form.fullAddress}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* District + Division */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                District
              </label>

              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Division
              </label>

              <input
                type="text"
                name="division"
                value={form.division}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

          </div>

          {/* ========================= */}
          {/* IMAGE MANAGEMENT */}
          {/* ========================= */}

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Listing Images
            </label>

            <p className="text-sm text-gray-500 mb-4">
              You can keep, remove, or add images.
              Maximum 4 images per listing.
            </p>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">

                <p className="text-sm font-medium text-gray-700 mb-3">
                  Current Images
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                  {existingImages.map(
                    (image, index) => (
                      <div
                        key={
                          image.publicId ||
                          index
                        }
                        className="relative"
                      >

                        <img
                          src={image.url}
                          alt={`Current ${index + 1}`}
                          className="w-full h-28 object-cover rounded-lg border"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingImage(
                              image
                            )
                          }
                          className="absolute top-1 right-1 bg-red-600 text-white w-7 h-7 rounded-full"
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                </div>
              </div>
            )}

            {/* Special message for old listings without images */}
            {existingImages.length === 0 &&
              newImages.length === 0 && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">

                  <p className="text-sm text-gray-600">
                    This listing currently has no images.
                    You can add images below.
                  </p>

                </div>
              )}

            {/* New Image Upload */}
            {existingImages.length +
              newImages.length <
              4 && (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
              />
            )}

            <p className="text-sm text-gray-500 mt-2">
              {existingImages.length +
                newImages.length}{" "}
              / 4 images selected
            </p>

            {/* New Image Preview */}
            {newImages.length > 0 && (
              <div className="mt-5">

                <p className="text-sm font-medium text-gray-700 mb-3">
                  New Images
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                  {newImages.map(
                    (image, index) => (
                      <div
                        key={`${image.name}-${index}`}
                        className="relative"
                      >

                        <img
                          src={URL.createObjectURL(
                            image
                          )}
                          alt={`New ${index + 1}`}
                          className="w-full h-28 object-cover rounded-lg border"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeNewImage(index)
                          }
                          className="absolute top-1 right-1 bg-red-600 text-white w-7 h-7 rounded-full"
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60"
            >
              {submitting
                ? "Updating..."
                : "Update Listing"}
            </button>

            <Link
              to="/my-listings"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

          </div>

        </form>
      </div>
    </div>
  );
}

export default EditListing;