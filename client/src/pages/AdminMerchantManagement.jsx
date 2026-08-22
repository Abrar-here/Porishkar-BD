import { useEffect, useState } from "react";
import axios from "axios";


function AdminMerchantManagement() {


    const emptyForm = {

        name:"",
        category:"organic_food",
        description:"",
        location:"",
        contactEmail:"",
        phone:"",
        voucherStock:"",
        voucherValue:""

    };


    const [merchants,setMerchants] = useState([]);

    const [form,setForm] = useState(emptyForm);

    const [editingId,setEditingId] = useState(null);



    useEffect(()=>{

        fetchMerchants();

    },[]);



    const getToken = () => {

        return localStorage.getItem("token");

    };





    const fetchMerchants = async()=>{

        try{


            const res = await axios.get(

                "http://localhost:5000/api/merchants",

                {

                    headers:{

                        Authorization:`Bearer ${getToken()}`

                    }

                }

            );


            setMerchants(res.data.merchants);


        }catch(error){

            console.log(error);

        }

    };






    const handleChange = (e)=>{


        const {name,value}=e.target;


        setForm({

            ...form,

            [name]:

            name==="voucherStock" || name==="voucherValue"

            ?

            value === "" ? "" : Number(value)

            :

            value

        });


    };







    const submitMerchant = async(e)=>{


        e.preventDefault();


        try{


            if(editingId){


                await axios.put(

                    `http://localhost:5000/api/merchants/${editingId}`,

                    form,

                    {

                        headers:{

                            Authorization:`Bearer ${getToken()}`

                        }

                    }

                );


            }
            else{


                await axios.post(

                    "http://localhost:5000/api/merchants",

                    form,

                    {

                        headers:{

                            Authorization:`Bearer ${getToken()}`

                        }

                    }

                );


            }



            setForm({

                ...emptyForm

            });


            setEditingId(null);


            fetchMerchants();



        }catch(error){

            console.log(error);

        }


    };







    const editMerchant=(merchant)=>{


        setEditingId(merchant._id);


        setForm({

            name:merchant.name || "",

            category:merchant.category || "organic_food",

            description:merchant.description || "",

            location:merchant.location || "",

            contactEmail:merchant.contactEmail || "",

            phone:merchant.phone || "",

            voucherStock:merchant.voucherStock ?? "",

            voucherValue:merchant.voucherValue ?? ""

        });


    };








    const deleteMerchant = async(id)=>{


        try{


            await axios.delete(

                `http://localhost:5000/api/merchants/${id}`,

                {

                    headers:{

                        Authorization:`Bearer ${getToken()}`

                    }

                }

            );


            fetchMerchants();


        }catch(error){

            console.log(error);

        }


    };









return (

<div className="max-w-6xl mx-auto p-6">


<h1 className="text-3xl font-bold text-green-600 mb-6">

Admin Merchant Management

</h1>





<form

onSubmit={submitMerchant}

className="bg-white shadow rounded-xl p-6 mb-8"

>



<input

className="border p-3 w-full mb-3"

name="name"

placeholder="Merchant Name"

value={form.name}

onChange={handleChange}

/>





<select

className="border p-3 w-full mb-3"

name="category"

value={form.category}

onChange={handleChange}

>


<option value="organic_food">
Organic Food
</option>


<option value="solar_products">
Solar Products
</option>


<option value="eco_store">
Eco Store
</option>


<option value="other">
Other
</option>


</select>






<input

className="border p-3 w-full mb-3"

name="location"

placeholder="Location"

value={form.location}

onChange={handleChange}

/>







<input

className="border p-3 w-full mb-3"

name="contactEmail"

placeholder="Contact Email"

value={form.contactEmail}

onChange={handleChange}

/>






<input

className="border p-3 w-full mb-3"

name="phone"

placeholder="Phone"

value={form.phone}

onChange={handleChange}

/>








<input

type="number"

className="border p-3 w-full mb-3"

name="voucherStock"

placeholder="Voucher Stock"

value={form.voucherStock}

onChange={handleChange}

/>







<input

type="number"

className="border p-3 w-full mb-3"

name="voucherValue"

placeholder="Voucher Value"

value={form.voucherValue}

onChange={handleChange}

/>








<textarea

className="border p-3 w-full mb-3"

name="description"

placeholder="Description"

value={form.description}

onChange={handleChange}

/>







<button

className="bg-green-600 text-white px-5 py-2 rounded"

>

{

editingId

?

"Update Merchant"

:

"Add Merchant"

}

</button>



</form>









<div className="grid md:grid-cols-3 gap-5">



{

merchants.map((merchant)=>(


<div

key={merchant._id}

className="bg-white shadow rounded-xl p-5"

>


<h2 className="font-bold text-xl">

{merchant.name}

</h2>



<p>

Category: {merchant.category}

</p>



<p>

Location: {merchant.location}

</p>



<p>

Voucher Stock: {merchant.voucherStock}

</p>



<p>

Voucher Value: {merchant.voucherValue}

</p>




<p className="mt-2 text-gray-600">

{merchant.description}

</p>





<button

onClick={()=>editMerchant(merchant)}

className="mt-4 mr-2 bg-blue-500 text-white px-3 py-1 rounded"

>

Edit

</button>






<button

onClick={()=>deleteMerchant(merchant._id)}

className="bg-red-500 text-white px-3 py-1 rounded"

>

Delete

</button>



</div>


))

}



</div>



</div>

);


}


export default AdminMerchantManagement;