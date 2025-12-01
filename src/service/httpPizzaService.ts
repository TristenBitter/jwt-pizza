import {
  PizzaService,
  Franchise,
  FranchiseList,
  Store,
  OrderHistory,
  User,
  Menu,
  Order,
  Endpoints,
  OrderResponse,
  JWTPayload,
  UserListResponse,
} from "./pizzaService";

interface EnvVars {
  VITE_PIZZA_SERVICE_URL?: string;
  VITE_PIZZA_FACTORY_URL?: string;
}

const env: EnvVars =
  typeof import.meta !== "undefined" && "env" in import.meta
    ? ((import.meta as ImportMeta).env as EnvVars)
    : {};

const pizzaServiceUrl =
  env.VITE_PIZZA_SERVICE_URL ?? "https://pizza-service.bamboogarden.click";
const pizzaFactoryUrl =
  env.VITE_PIZZA_FACTORY_URL ?? "https://pizza-factory.cs329.click";

class HttpPizzaService implements PizzaService {
  async callEndpoint(
    path: string,
    method: string = "GET",
    body?: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      };

      const authToken = localStorage.getItem("token");
      if (authToken) {
        (options.headers as Record<string, string>)[
          "Authorization"
        ] = `Bearer ${authToken}`;
      }

      if (body) {
        options.body = JSON.stringify(body);
      }

      if (!path.startsWith("http")) {
        path = pizzaServiceUrl + path;
      }

      const response = await fetch(path, options);
      const json = await response.json();

      if (response.ok) {
        return json;
      } else {
        throw {
          code: response.status,
          message: (json as { message?: string }).message ?? "Error",
        };
      }
    } catch (err) {
      if (err instanceof Error) {
        throw { code: 500, message: err.message };
      }
      throw { code: 500, message: "Unknown error" };
    }
  }

  async login(email: string, password: string): Promise<User> {
    const result = (await this.callEndpoint("/api/auth", "PUT", {
      email,
      password,
    })) as {
      user: User;
      token: string;
    };
    localStorage.setItem("token", result.token);
    return result.user;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const result = (await this.callEndpoint("/api/auth", "POST", {
      name,
      email,
      password,
    })) as { user: User; token: string };
    localStorage.setItem("token", result.token);
    return result.user;
  }

  logout(): void {
    this.callEndpoint("/api/auth", "DELETE").catch(() => {});
    localStorage.removeItem("token");
  }

  async getUser(): Promise<User | null> {
    if (!localStorage.getItem("token")) {
      return null;
    }
    try {
      return (await this.callEndpoint("/api/user/me")) as User;
    } catch {
      localStorage.removeItem("token");
      return null;
    }
  }

  async updateUser(updatedUser: User): Promise<User> {
    const result = (await this.callEndpoint(
      `/api/user/${updatedUser.id}`,
      "PUT",
      updatedUser
    )) as { user: User; token?: string };

    // Persist the token if returned
    if (result.token) {
      localStorage.setItem("token", result.token);
    }

    // Return the updated user object
    return result.user;
  }

  async getUsers(
    page: number,
    limit: number,
    name: string
  ): Promise<UserListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      name: name || "*",
    });

    const response = (await this.callEndpoint(
      `/api/user?${params.toString()}`,
      "GET"
    )) as UserListResponse;
    return response;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.callEndpoint(`/api/user/${userId}`, "DELETE");
    return Promise.resolve();
  }

  async getMenu(): Promise<Menu> {
    return (await this.callEndpoint("/api/order/menu")) as Menu;
  }

  async getOrders(): Promise<OrderHistory> {
    return (await this.callEndpoint("/api/order")) as OrderHistory;
  }

  async order(order: Order): Promise<OrderResponse> {
    return (await this.callEndpoint(
      "/api/order",
      "POST",
      order
    )) as OrderResponse;
  }

  async verifyOrder(jwt: string): Promise<JWTPayload> {
    return (await this.callEndpoint(
      pizzaFactoryUrl + "/api/order/verify",
      "POST",
      {
        jwt,
      }
    )) as JWTPayload;
  }

  async getFranchise(user: User): Promise<Franchise[]> {
    return (await this.callEndpoint(
      `/api/franchise/${user.id}`
    )) as Franchise[];
  }

  async createFranchise(franchise: Franchise): Promise<Franchise> {
    return (await this.callEndpoint(
      "/api/franchise",
      "POST",
      franchise
    )) as Franchise;
  }

  async getFranchises(
    page: number = 0,
    limit: number = 10,
    nameFilter: string = "*"
  ): Promise<FranchiseList> {
    return (await this.callEndpoint(
      `/api/franchise?page=${page}&limit=${limit}&name=${nameFilter}`
    )) as FranchiseList;
  }

  async closeFranchise(franchise: Franchise): Promise<void> {
    await this.callEndpoint(`/api/franchise/${franchise.id}`, "DELETE");
  }

  async createStore(franchise: Franchise, store: Store): Promise<Store> {
    return (await this.callEndpoint(
      `/api/franchise/${franchise.id}/store`,
      "POST",
      store
    )) as Store;
  }

  async closeStore(franchise: Franchise, store: Store): Promise<null> {
    await this.callEndpoint(
      `/api/franchise/${franchise.id}/store/${store.id}`,
      "DELETE"
    );
    return null;
  }

  async docs(docType: string): Promise<Endpoints> {
    if (docType === "factory") {
      return (await this.callEndpoint(
        pizzaFactoryUrl + "/api/docs"
      )) as Endpoints;
    }
    return (await this.callEndpoint("/api/docs")) as Endpoints;
  }
}

const httpPizzaService = new HttpPizzaService();
export default httpPizzaService;
