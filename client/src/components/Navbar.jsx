// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// function Navbar() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   // Highlight active menu
//   const isActive = (path) =>
//     location.pathname.startsWith(path)
//       ? "text-green-600 font-semibold border-b-2 border-green-600 pb-0.5"
//       : "text-gray-600 hover:text-green-600 transition-colors";


//   // Citizen / Buyer / Seller
//   const citizenLinks = [
//     {
//       to: "/dashboard",
//       label: "Dashboard",
//     },
//     {
//       to: "/marketplace",
//       label: "Marketplace",
//     },
//     {
//       to: "/my-listings",
//       label: "My Listings",
//     },
//     {
//       to: "/my-offers",
//       label: "My Offers",
//     },
//     {
//       to: "/report",
//       label: "Report Waste",
//     },
//     {
//       to: "/my-reports",
//       label: "My Reports",
//     },
//     {
//       to: "/recycling-centres",
//       label: "Recycling Centres",
//     },
//     {
//       to: "/eco-points",
//       label: "Eco Points",
//     },
//     {
//       to: "/leaderboard",
//       label: "Leaderboard",
//     },
//     {
//       to: "/achievements",
//       label: "Achievements",
//     },
//   ];


//   // Collector
//   const collectorLinks = [
//     {
//       to: "/dashboard?tab=available",
//       label: "Available Pickups",
//     },
//     {
//       to: "/dashboard?tab=assigned",
//       label: "My Pickups",
//     },
//   ];


//   // Recycling Company
//   const recyclingLinks = [
//     {
//       to: "/dashboard",
//       label: "Dashboard",
//     },
//     {
//       to: "/marketplace",
//       label: "Marketplace",
//     },
//     {
//       to: "/my-listings",
//       label: "My Listings",
//     },
//   ];


//   // Admin
//   const adminLinks = [
//     {
//       to: "/dashboard",
//       label: "Dashboard",
//     },
//     {
//       to: "/admin/reports",
//       label: "All Reports",
//     },
//     {
//       to: "/admin/users",
//       label: "Users",
//     },
//     {
//       to: "/recycling-centres",
//       label: "Recycling Centres",
//     },
//   ];


//   const getLinks = () => {
//     switch (user?.role) {
//       case "citizen":
//         return citizenLinks;

//       case "collector":
//         return collectorLinks;

//       case "recycling_company":
//         return recyclingLinks;

//       case "admin":
//         return adminLinks;

//       default:
//         return [];
//     }
//   };


//   return (
//     <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">

//       <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

//         {/* Logo */}
//         <Link
//           to="/dashboard"
//           className="text-xl font-bold text-green-600 shrink-0"
//         >
//           PorishkarBD
//         </Link>


//         {/* Navigation */}
//         <div className="hidden md:flex items-center gap-5">

//           {getLinks().map((link) => (

//             <Link
//               key={link.to}
//               to={link.to}
//               className={`text-sm ${isActive(link.to)}`}
//             >
//               {link.label}
//             </Link>

//           ))}

//         </div>


//         {/* User Profile */}
//         <div className="flex items-center gap-3">

//           {user && (

//             <div className="flex items-center gap-2">

//               <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">

//                 <span className="text-green-700 text-xs font-bold">

//                   {user.name?.charAt(0).toUpperCase()}

//                 </span>

//               </div>


//               <div className="hidden md:block">

//                 <p className="text-xs font-medium text-gray-800 leading-tight">

//                   {user.name}

//                 </p>


//                 <p className="text-xs text-gray-400 capitalize leading-tight">

//                   {user.role?.replace("_", " ")}

//                 </p>

//               </div>

//             </div>

//           )}


//           {/* Logout */}
//           <button
//             onClick={handleLogout}
//             className="px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 border border-red-100 shrink-0"
//           >
//             Logout
//           </button>


//         </div>

//       </div>

//     </nav>
//   );
// }

// export default Navbar;


import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();



  const handleLogout = () => {

    logout();

    navigate("/login");

  };



  // Highlight active menu

  const isActive = (path) =>

    location.pathname.startsWith(path)

      ? "text-green-600 font-semibold border-b-2 border-green-600 pb-0.5"

      : "text-gray-600 hover:text-green-600 transition-colors";





  // Citizen / Buyer / Seller

  const citizenLinks = [

    {
      to: "/dashboard",
      label: "Dashboard",
    },

    {
      to: "/marketplace",
      label: "Marketplace",
    },

    {
      to: "/my-listings",
      label: "My Listings",
    },

    {
      to: "/my-offers",
      label: "My Offers",
    },

    {
      to: "/report",
      label: "Report Waste",
    },

    {
      to: "/my-reports",
      label: "My Reports",
    },

    {
      to: "/recycling-centres",
      label: "Recycling Centres",
    },

    {
      to: "/eco-points",
      label: "Eco Points",
    },

    {
      to: "/leaderboard",
      label: "Leaderboard",
    },

    {
      to: "/achievements",
      label: "Achievements",
    },

  ];





  // Collector

  const collectorLinks = [

    {
      to: "/dashboard?tab=available",
      label: "Available Pickups",
    },

    {
      to: "/dashboard?tab=assigned",
      label: "My Pickups",
    },

  ];





  // Recycling Company

  const recyclingLinks = [

    {
      to: "/dashboard",
      label: "Dashboard",
    },

    {
      to: "/marketplace",
      label: "Marketplace",
    },

    {
      to: "/my-listings",
      label: "My Listings",
    },

  ];





  // Admin

  const adminLinks = [

    {
      to: "/dashboard",
      label: "Dashboard",
    },

    {
      to: "/admin/reports",
      label: "All Reports",
    },

    {
      to: "/admin/users",
      label: "Users",
    },

    {
      to: "/recycling-centres",
      label: "Recycling Centres",
    },

  ];







  // Updated role handling

  const getLinks = () => {


    const role = user?.role?.toLowerCase();



    switch(role) {


      case "citizen":

      case "buyer":

      case "seller":

        return citizenLinks;



      case "collector":

        return collectorLinks;



      case "recycling_company":

      case "recycling company":

        return recyclingLinks;



      case "admin":

        return adminLinks;



      default:

        return citizenLinks;

    }

  };







  return (

    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">


      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">



        {/* Logo */}

        <Link

          to="/dashboard"

          className="text-xl font-bold text-green-600 shrink-0"

        >

          PorishkarBD

        </Link>





        {/* Navigation */}

        <div className="hidden md:flex items-center gap-5">


          {getLinks().map((link) => (


            <Link

              key={link.to}

              to={link.to}

              className={`text-sm ${isActive(link.to)}`}

            >

              {link.label}

            </Link>


          ))}


        </div>







        {/* User Profile */}

        <div className="flex items-center gap-3">



          {user && (


            <div className="flex items-center gap-2">


              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">


                <span className="text-green-700 text-xs font-bold">


                  {user.name?.charAt(0).toUpperCase()}


                </span>


              </div>





              <div className="hidden md:block">


                <p className="text-xs font-medium text-gray-800 leading-tight">

                  {user.name}

                </p>



                <p className="text-xs text-gray-400 capitalize leading-tight">

                  {user.role?.replace("_", " ")}

                </p>


              </div>


            </div>


          )}







          {/* Logout */}

          <button

            onClick={handleLogout}

            className="px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 border border-red-100 shrink-0"

          >

            Logout

          </button>



        </div>



      </div>



    </nav>

  );

}


export default Navbar;