import React from "react";
import View from "./view";
import { useNavigate } from "react-router-dom";
import Button from "../components/button";
import { pizzaService } from "../service/service";
import {
  Franchise,
  FranchiseList,
  Role,
  Store,
  User,
  UserListResponse,
  isRole,
} from "../service/pizzaService";
import { TrashIcon } from "../icons";

interface Props {
  user: User | null;
}

// interface UserListResponse {
//   users: User[];
//   more: boolean;
// }

export default function AdminDashboard({ user }: Props) {
  const navigate = useNavigate();
  const [view, setView] = React.useState<'franchises' | 'users'>('franchises');
  
  // Franchise state
  const [franchiseList, setFranchiseList] = React.useState<FranchiseList>({
    franchises: [],
    more: false,
  });
  const [franchisePage, setFranchisePage] = React.useState(0);
  const franchiseFilterRef = React.useRef<HTMLInputElement>(null);

  // User state
  const [userList, setUserList] = React.useState<UserListResponse>({
    users: [],
    more: false,
  });
  const [userPage, setUserPage] = React.useState(0);
  const userFilterRef = React.useRef<HTMLInputElement>(null);

  // Load franchises
  React.useEffect(() => {
    (async () => {
      if (user && isRole(user, Role.Admin) && view === 'franchises') {
        const list = await pizzaService.getFranchises(franchisePage, 10, "*");
        setFranchiseList(list);
      }
    })();
  }, [user, franchisePage, view]);

  // Load users
  React.useEffect(() => {
    (async () => {
      if (user && isRole(user, Role.Admin) && view === 'users') {
        const nameFilter = userFilterRef.current?.value || "";
        const list = await pizzaService.getUsers(userPage, 10, nameFilter ? `*${nameFilter}*` : "*");
        setUserList(list);
      }
    })();
  }, [user, userPage, view]);

  const createFranchise = () => navigate("/admin-dashboard/create-franchise");
  const closeFranchise = (franchise: Franchise) =>
    navigate("/admin-dashboard/close-franchise", { state: { franchise } });
  const closeStore = (franchise: Franchise, store: Store) =>
    navigate("/admin-dashboard/close-store", { state: { franchise, store } });

  const filterFranchises = async () => {
    const filterValue = franchiseFilterRef.current?.value || "";
    const list = await pizzaService.getFranchises(
      franchisePage,
      10,
      `*${filterValue}*`
    );
    setFranchiseList(list);
  };

  const filterUsers = async () => {
    const filterValue = userFilterRef.current?.value || "";
    const list = await pizzaService.getUsers(
      0,
      10,
      filterValue ? `*${filterValue}*` : "*"
    );
    setUserList(list);
    setUserPage(0);
  };

  const deleteUser = async (userId: string | undefined) => {
    if (!userId) return;
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await pizzaService.deleteUser(userId);
        // Reload the user list
        const filterValue = userFilterRef.current?.value || "";
        const list = await pizzaService.getUsers(
          userPage,
          10,
          filterValue ? `*${filterValue}*` : "*"
        );
        setUserList(list);
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  //  Unauthorized access
  if (!user || !isRole(user, Role.Admin)) {
    return (
      <View title="Unauthorized">
        <div className="p-10 text-center text-red-400">
          <h1 className="text-2xl font-bold">Unauthorized</h1>
          <p>You do not have access to this page.</p>
        </div>
      </View>
    );
  }

  return (
    <View title={view === 'users' ? 'User List' : 'Franchise Dashboard'}>
      <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
        {/* View Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView('franchises')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              view === 'franchises'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Franchises
          </button>
          <button
            onClick={() => setView('users')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              view === 'users'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Users
          </button>
        </div>

        {view === 'franchises' ? (
          <>
            <h3 className="text-neutral-100 text-xl mb-4">Franchise Dashboard</h3>
            <div className="bg-neutral-100 overflow-clip my-4">
              <div className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                  <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                          <tr>
                            <th className="px-6 py-3 text-start text-xs font-medium">
                              Franchise
                            </th>
                            <th className="px-6 py-3 text-start text-xs font-medium">
                              Franchisee
                            </th>
                            <th className="px-6 py-3 text-start text-xs font-medium">
                              Store
                            </th>
                            <th className="px-6 py-3 text-start text-xs font-medium">
                              Revenue
                            </th>
                            <th className="px-6 py-3 text-start text-xs font-medium">
                              Action
                            </th>
                          </tr>
                        </thead>
                        {franchiseList.franchises.map((franchise, findex) => (
                          <tbody key={findex} className="divide-y divide-gray-200">
                            <tr className="border-neutral-500 border-t-2">
                              <td className="text-start px-2 whitespace-nowrap text-sm font-semibold text-orange-600">
                                {franchise.name}
                              </td>
                              <td
                                className="text-start px-2 whitespace-nowrap text-sm text-gray-800"
                                colSpan={3}
                              >
                                {franchise.admins
                                  ?.map((o) => o.name)
                                  .join(", ") || "—"}
                              </td>
                              <td className="px-6 py-1 whitespace-nowrap text-end text-sm font-medium">
                                <button
                                  type="button"
                                  className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                                  onClick={() => closeFranchise(franchise)}
                                >
                                  <TrashIcon /> Close
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
                                    className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                                    onClick={() => closeStore(franchise, store)}
                                  >
                                    <TrashIcon /> Close
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        ))}
                        <tfoot>
                          <tr>
                            <td className="px-1 py-1" colSpan={5}>
                              <input
                                type="text"
                                ref={franchiseFilterRef}
                                placeholder="Search"
                                aria-label="search"
                                className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                              />
                              <button
                                type="submit"
                                className="ml-2 px-2 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                                onClick={filterFranchises}
                              >
                                Search
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={5} className="text-end">
                              <button
                                className="w-12 p-1 text-sm rounded-lg border bg-white m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                                onClick={() => setFranchisePage(franchisePage - 1)}
                                disabled={franchisePage <= 0}
                              >
                                « Prev
                              </button>
                              <button
                                className="w-12 p-1 text-sm rounded-lg border bg-white m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                                onClick={() => setFranchisePage(franchisePage + 1)}
                                disabled={!franchiseList.more}
                              >
                                Next »
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
            <Button
              className="w-36 text-xs sm:text-sm sm:w-64"
              title="Add Franchise"
              onPress={createFranchise}
            />
          </>
        ) : (
          <>
            <h3 className="text-neutral-100 text-xl mb-4">Users</h3>
            <div className="bg-neutral-100 overflow-clip my-4">
              <div className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                  <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="uppercase text-neutral-100 bg-slate-400 border-b-2 border-gray-500">
                          <tr>
                            <th className="px-6 py-3 text-start text-xs font-medium">
                              Name
                            </th>
                            <th className="px-6 py-3 text-start text-xs font-medium">
                              Email
                            </th>
                            <th className="px-6 py-3 text-start text-xs font-medium">
                              Role
                            </th>
                            <th className="px-6 py-3 text-start text-xs font-medium">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {userList.users.map((u) => (
                            <tr key={u.id}>
                              <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-800">
                                {u.name}
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-800">
                                {u.email}
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-800">
                                {u.roles?.map((r) => r.role).join(", ") || "diner"}
                              </td>
                              <td className="px-6 py-2 whitespace-nowrap text-end text-sm font-medium">
                                <button
                                  type="button"
                                  className="px-2 py-1 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-red-400 text-red-400 hover:border-red-800 hover:text-red-800 disabled:opacity-50"
                                  onClick={() => deleteUser(u.id)}
                                  disabled={u.id === user?.id}
                                >
                                  <TrashIcon /> Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td className="px-1 py-1" colSpan={4}>
                              <input
                                type="text"
                                ref={userFilterRef}
                                placeholder="Filter by name"
                                aria-label="search"
                                className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
                              />
                              <button
                                type="submit"
                                className="ml-2 px-2 py-1 text-sm font-semibold rounded-lg border border-orange-400 text-orange-400 hover:border-orange-800 hover:text-orange-800"
                                onClick={filterUsers}
                              >
                                Search
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={4} className="text-end">
                              <button
                                className="w-12 p-1 text-sm rounded-lg border bg-white m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                                onClick={() => setUserPage(userPage - 1)}
                                disabled={userPage <= 0}
                              >
                                « Prev
                              </button>
                              <button
                                className="w-12 p-1 text-sm rounded-lg border bg-white m-1 hover:bg-orange-200 disabled:bg-neutral-300"
                                onClick={() => setUserPage(userPage + 1)}
                                disabled={!userList.more}
                              >
                                Next »
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
          </>
        )}
      </div>
    </View>
  );
}