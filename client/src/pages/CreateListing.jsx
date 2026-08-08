import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function CreateListing() {
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

  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If Donation is selected, remove asking price
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

  // Select listing images
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 4) {
      setError("You can upload a maximum of 4 images.");
      e.target.value = "";
      return;
    }

    // Check file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    const invalidFile = selectedFiles.find(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFile) {
      setError("Only JPG, JPEG, PNG and WebP images are allowed.");
      e.target.value = "";
      return;
    }

    // Check each image size - maximum 5 MB
    const tooLarge = selectedFiles.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (tooLarge) {
      setError("Each image must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setImages(selectedFiles);
  };

  // Remove one selected image
  const removeImage = (index) => {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();

      // Add normal form fields
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("materialType", form.materialType);
      formData.append("quantityValue", form.quantityValue);
      formData.append("quantityUnit", form.quantityUnit);
      formData.append("condition", form.condition);
      formData.append("listingType", form.listingType);

      if (form.listingType === "Sale") {
        formData.append("askingPrice", form.askingPrice);
      }

      formData.append("fullAddress", form.fullAddress);
      formData.append("district", form.district);
      formData.append("division", form.division);

      // Add images
      images.forEach((image) => {
        formData.append("images", image);
      });

      await api.post("/listings", formData);

      navigate("/marketplace");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create listing"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Create Listing
          </h1>

          <p className="text-gray-500 mt-2">
            Publish your recyclable materials.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

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
              placeholder="Example: 20 KG Clean Plastic Bottles"
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
              placeholder="Describe the recyclable materials..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Material Type */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Material Type
            </label>

            <select
              name="materialType"
              value={form.materialType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select material</option>
              <option value="Plastic">Plastic</option>
              <option value="Paper">Paper</option>
              <option value="Metal">Metal</option>
              <option value="Glass">Glass</option>
              <option value="Electronic Waste">
                Electronic Waste
              </option>
              <option value="Textile">Textile</option>
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
                placeholder="20"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="piece">piece</option>
                <option value="bag">bag</option>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select condition</option>
              <option value="Clean">Clean</option>
              <option value="Soiled">Soiled</option>
              <option value="Mixed">Mixed</option>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="Sale">Sale</option>
              <option value="Donation">Donation</option>
            </select>
          </div>

          {/* Price */}
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
                placeholder="700"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {/* Address */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Pickup Address
            </label>

            <input
              type="text"
              name="fullAddress"
              value={form.fullAddress}
              onChange={handleChange}
              placeholder="Example: Mirpur 10, Dhaka"
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
                placeholder="Dhaka"
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
                placeholder="Dhaka"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

          </div>

          {/* Images */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Listing Images
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
            />

            <p className="text-sm text-gray-500 mt-2">
              Upload up to 4 images. Maximum 5 MB per image.
            </p>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">

                {images.map((image, index) => (
                  <div
                    key={`${image.name}-${index}`}
                    className="relative"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-28 object-cover rounded-lg border"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white w-7 h-7 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                ))}

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
              {submitting ? "Creating..." : "Create Listing"}
            </button>

            <Link
              to="/marketplace"
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

export default CreateListing;