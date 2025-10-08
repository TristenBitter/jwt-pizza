import React from "react";
import { useBreadcrumb } from "../hooks/appNavigation";
import { EmailIcon, StoreIcon } from "../icons";
import { pizzaService } from "../service/service";
import View from "./view";
import Button from "../components/button";
import { Franchise, Role, isRole, User } from "../service/pizzaService";

interface Props {
  user: User | null;
}

export default function CreateFranchise({ user }: Props) {
  const navigateToParentPath = useBreadcrumb();
  const [franchise, setFranchise] = React.useState<Franchise>({
    stores: [],
    id: "",
    name: "",
  });

  async function createFranchise(event: React.FormEvent) {
    event.preventDefault();
    await pizzaService.createFranchise(franchise);
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
    <View title="Create Franchise">
      <div className="text-start py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={createFranchise}>
          <div className="text-neutral-100">
            Want to create a new franchise?
          </div>
          <div className="max-w-sm space-y-3 py-4 flex-1">
            <div className="relative">
              <input
                type="text"
                required
                onChange={(e) =>
                  setFranchise({ ...franchise, name: e.target.value })
                }
                className="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Franchise name"
              />
              <div className="absolute text-orange-800 inset-y-0 start-0 flex items-center ps-4">
                <StoreIcon />
              </div>
            </div>
            <div className="relative">
              <input
                type="email"
                required
                onChange={(e) =>
                  setFranchise({
                    ...franchise,
                    admins: [{ email: e.target.value }],
                  })
                }
                className="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Franchise admin email"
              />
              <div className="absolute text-orange-800 inset-y-0 start-0 flex items-center ps-4">
                <EmailIcon />
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
