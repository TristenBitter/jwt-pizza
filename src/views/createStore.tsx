import React from "react";
import { useLocation } from "react-router-dom";
import { useBreadcrumb } from "../hooks/appNavigation";
import { StoreIcon } from "../icons";
import View from "./view";
import Button from "../components/button";
import { pizzaService } from "../service/service";
import { Store, Role, isRole, User } from "../service/pizzaService";

interface Props {
  user: User | null;
}

export default function CreateStore({ user }: Props) {
  const state = useLocation().state;
  const navigateToParentPath = useBreadcrumb();
  const [store, setStore] = React.useState<Store>({ id: "", name: "" });

  async function createStore(event: React.FormEvent) {
    event.preventDefault();
    await pizzaService.createStore(state.franchise, store);
    navigateToParentPath();
  }

  if (!user || !isRole(user, Role.Admin)) {
    return (
      <View title="Access Denied">
        <div className="p-6 text-center text-red-500">
          <h2>Access denied. Admins only.</h2>
        </div>
      </View>
    );
  }

  return (
    <View title="Create Store">
      <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={createStore}>
          <div className="flex">
            <div className="max-w-sm space-y-3 py-4 flex-1">
              <div className="relative">
                <input
                  type="text"
                  required
                  onChange={(e) => setStore({ ...store, name: e.target.value })}
                  className="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Store name"
                />
                <div className="absolute text-orange-800 inset-y-0 start-0 flex items-center ps-4">
                  <StoreIcon />
                </div>
              </div>
            </div>
          </div>

          <Button title="Create" submit onPress={() => {}} />
          <Button
            title="Cancel"
            onPress={navigateToParentPath}
            className="bg-transparent border-neutral-300"
          />
        </form>
      </div>
    </View>
  );
}
