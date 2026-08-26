import { useEffect, useState } from "react";
import axios from "axios";

function AdminMerchantManagement() {
  const emptyForm = {
    name: "",
    category: "organic_food",
    description: "",
    location: "",
    contactEmail: "",
    phone: "",
    voucherStock: "",
    voucherValue: "",
  };

  const [merchants, setMerchants] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchMerchants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/merchants", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      setMerchants(res.data.merchants);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]:
        name === "voucherStock" || name === "voucherValue"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    });
  };

  const submitMerchant = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/merchants/${editingId}`,

          form,

          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/merchants",

          form,

          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          },
        );
      }

      setForm({
        ...emptyForm,
      });

      setEditingId(null);

      fetchMerchants();
    } catch (error) {
      console.log(error);
    }
  };

  const editMerchant = (merchant) => {
    setEditingId(merchant._id);

    setForm({
      name: merchant.name || "",

      category: merchant.category || "organic_food",

      description: merchant.description || "",

      location: merchant.location || "",

      contactEmail: merchant.contactEmail || "",

      phone: merchant.phone || "",

      voucherStock: merchant.voucherStock ?? "",

      voucherValue: merchant.voucherValue ?? "",
    });
  };

  const deleteMerchant = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/merchants/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      fetchMerchants();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf7] text-gray-800">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Admin Merchant Management
        </h1>

        <form
          onSubmit={submitMerchant}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Merchant Name
            </label>
            <input
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              name="name"
              placeholder="Merchant Name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Category
            </label>
            <select
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="organic_food">Organic Food</option>

              <option value="solar_products">Solar Products</option>

              <option value="eco_store">Eco Store</option>

              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Location
            </label>
            <input
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Contact Email
              </label>
              <input
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                name="contactEmail"
                placeholder="Contact Email"
                value={form.contactEmail}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Phone
              </label>
              <input
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Voucher Stock
              </label>
              <input
                type="number"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                name="voucherStock"
                placeholder="Voucher Stock"
                value={form.voucherStock}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Voucher Value
              </label>
              <input
                type="number"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                name="voucherValue"
                placeholder="Voucher Value"
                value={form.voucherValue}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition resize-none"
              name="description"
              placeholder="Description"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <button className="bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-800 shadow-sm hover:shadow transition cursor-pointer">
            {editingId ? "Update Merchant" : "Add Merchant"}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {merchants.map((merchant) => (
            <div
              key={merchant._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <h2 className="font-bold text-lg text-gray-900">
                {merchant.name}
              </h2>

              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-gray-700">Category:</span>{" "}
                  {merchant.category}
                </p>

                <p>
                  <span className="font-semibold text-gray-700">Location:</span>{" "}
                  {merchant.location}
                </p>

                <p>
                  <span className="font-semibold text-gray-700">
                    Voucher Stock:
                  </span>{" "}
                  {merchant.voucherStock}
                </p>

                <p>
                  <span className="font-semibold text-gray-700">
                    Voucher Value:
                  </span>{" "}
                  {merchant.voucherValue}
                </p>
              </div>

              <p className="mt-3 text-sm text-gray-500">
                {merchant.description}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => editMerchant(merchant)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteMerchant(merchant._id)}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AdminMerchantManagement;
