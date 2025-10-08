import React from "react";
import View from "./view";
import { useNavigate } from "react-router-dom";
import NotFound from "./notFound";
import Button from "../components/button";
import { pizzaService } from "../service/service";
import {
  Franchise,
  FranchiseList,
  Role,
  Store,
  User,
  isRole,
} from "../service/pizzaService";
import { TrashIcon } from "../icons";

/* ✅ Extend the Window interface for typed debug access */
declare global {
  interface Window {
    __lastUser?: User;
  }
}

interface Props {
  user: User | null;
}

export default function AdminDashboard({ user }: Props) {
  const navigate = useNavigate();
  const [franchiseList, setFranchiseList] = React.useState<FranchiseList>({
    franchises: [],
    more: false,
  });
  const [franchisePage, setFranchisePage] = React.useState(0);
  const filterFranchiseRef = React.useRef<HTMLInputElement>(null);

  /* 🧠 DEBUG: log what the dashboard actually sees */
  React.useEffect(() => {
    console.log("🔍 [AdminDashboard] user prop:", user);
    if (user) {
      console.log("🔍 [AdminDashboard] roles:", user.roles);
      window.__lastUser = user; // ✅ typed now, no eslint error
    } else {
      console.warn("⚠️ [AdminDashboard] No user detected!");
    }
  }, [user]);

  // ✅ safer async load with dependency checks
  React.useEffect(() => {
    (async () => {
      if (user && isRole(user, Role.Admin)) {
        const list = await pizzaService.getFranchises(franchisePage, 3, "*");
        setFranchiseList(list);
      } else {
        console.warn(
          "🚫 [AdminDashboard] User not admin, skipping franchise fetch"
        );
      }
    })();
  }, [user, franchisePage]);

  const createFranchise = () => navigate("/admin-dashboard/create-franchise");

  const closeFranchise = (franchise: Franchise) =>
    navigate("/admin-dashboard/close-franchise", { state: { franchise } });

  const closeStore = (franchise: Franchise, store: Store) =>
    navigate("/admin-dashboard/close-store", { state: { franchise, store } });

  const filterFranchises = async () => {
    const filterValue = filterFranchiseRef.current?.value || "";
    const list = await pizzaService.getFranchises(
      franchisePage,
      10,
      `*${filterValue}*`
    );
    setFranchiseList(list);
  };

  // ✅ use the correct function
  if (!user || !isRole(user, Role.Admin)) {
    console.warn("🚫 [AdminDashboard] Access denied – user not admin or null");
    return <NotFound />;
  }

  // ✅ main admin dashboard content
  return (
    <View title="Mama Ricci's kitchen">
      <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
        <h3 className="text-neutral-100 text-xl">Franchises</h3>
        <div className="bg-neutral-100 overflow-clip my-4">
          <div className="flex flex-col">
            <div className="-m-1.5 overflow-x-auto">
              <div className="p-1.5 min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                      <tr>
                        {[
                          "Franchise",
                          "Franchisee",
                          "Store",
                          "Revenue",
                          "Action",
                        ].map((header) => (
                          <th
                            key={header}
                            scope="col"
                            className="px-6 py-3 text-center text-xs font-medium"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    {franchiseList.franchises.map((franchise, findex) => (
                      <tbody key={findex} className="divide-y divide-gray-200">
                        <tr className="border-neutral-500 border-t-2">
                          <td className="text-start px-2 whitespace-nowrap text-l font-mono text-orange-600">
                            {franchise.name}
                          </td>
                          <td
                            className="text-start px-2 whitespace-nowrap text-sm font-normal text-gray-800"
                            colSpan={3}
                          >
                            {franchise.admins?.map((o) => o.name).join(", ")}
                          </td>
                          <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                            <button
                              type="button"
                              className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400  hover:border-orange-800 hover:text-orange-800"
                              onClick={() => closeFranchise(franchise)}
                            >
                              <TrashIcon />
                              Close
                            </button>
                          </td>
                        </tr>

                        {franchise.stores.map((store, sindex) => (
                          <tr key={sindex} className="bg-neutral-100">
                            <td
                              className="text-end px-2 whitespace-nowrap text-sm text-gray-800"
                              colSpan={3}
                            >
                              {store.name}
                            </td>
                            <td className="text-end px-2 whitespace-nowrap text-sm text-gray-800">
                              {store.totalRevenue?.toLocaleString()} ₿
                            </td>
                            <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                              <button
                                type="button"
                                className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-1 border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                                onClick={() => closeStore(franchise, store)}
                              >
                                <TrashIcon />
                                Close
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    ))}
                    <tfoot>
                      <tr>
                        <td className="px-1 py-1">
                          <input
                            type="text"
                            ref={filterFranchiseRef}
                            name="filterFranchise"
                            placeholder="Filter franchises"
                            className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                          />
                          <button
                            type="submit"
                            className="ml-2 px-2 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                            onClick={filterFranchises}
                          >
                            Submit
                          </button>
                        </td>
                        <td
                          colSpan={4}
                          className="text-end text-sm font-medium"
                        >
                          <button
                            className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300 "
                            onClick={() => setFranchisePage(franchisePage - 1)}
                            disabled={franchisePage <= 0}
                          >
                            «
                          </button>
                          <button
                            className="w-12 p-1 text-sm font-semibold rounded-lg border border-transparent bg-white text-grey border-grey m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                            onClick={() => setFranchisePage(franchisePage + 1)}
                            disabled={!franchiseList.more}
                          >
                            »
                          </button>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Button
          className="w-36 text-xs sm:text-sm sm:w-64"
          title="Add Franchise"
          onPress={createFranchise}
        />
      </div>
    </View>
  );
}
