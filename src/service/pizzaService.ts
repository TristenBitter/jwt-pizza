enum Role {
  Diner = "diner",
  Franchisee = "franchisee",
  Admin = "admin",
  isRole = "isRole",
}

function isRole(user: User | null, role: Role): boolean {
  return (
    user != null &&
    Array.isArray(user.roles) &&
    !!user.roles.find((r) => r.role === role)
  );
}

type Menu = Pizza[];

type Pizza = {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
};

type OrderItem = {
  menuId: string;
  description: string;
  price: number;
};

type Order = {
  id: string;
  franchiseId: string;
  storeId: string;
  date: string;
  items: OrderItem[];
};

type OrderResponse = {
  order: Order;
  jwt: string;
};

type OrderHistory = {
  id: string;
  dinerId: string;
  orders: Order[];
};

type UserRole = {
  role: Role;
  objectId?: string;
};

type User = {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  roles?: UserRole[];
};

type Store = {
  id: string;
  name: string;
  totalRevenue?: number;
};

type Franchise = {
  id: string;
  admins?: { email: string; id?: string; name?: string }[];
  name: string;
  stores: Store[];
};

type FranchiseList = {
  franchises: Franchise[];
  more: boolean;
};

type Endpoint<T = unknown> = {
  requiresAuth: boolean;
  method: string;
  path: string;
  description: string;
  example: string;
  response: T;
};

type Endpoints = {
  endpoints: Endpoint[];
};

type JWTPayload = {
  message: string;
  payload: string;
};

// Replace the interface in your pizzaService.ts with this:

interface UserListResponse {
  users: User[];
  more: boolean;
}

interface PizzaService {
  login(email: string, password: string): Promise<User>;
  register(email: string, password: string, role: string): Promise<User>;
  logout(): void;
  getUser(): Promise<User | null>;
  getMenu(): Promise<Menu>;
  getOrders(user: User): Promise<OrderHistory>;
  order(order: Order): Promise<OrderResponse>;
  verifyOrder(jwt: string): Promise<JWTPayload>;
  getFranchise(user: User): Promise<Franchise[]>;
  createFranchise(franchise: Franchise): Promise<Franchise>;
  getFranchises(
    page: number,
    limit: number,
    nameFilter: string
  ): Promise<FranchiseList>;
  closeFranchise(franchise: Franchise): Promise<void>;
  createStore(franchise: Franchise, store: Store): Promise<Store>;
  closeStore(franchise: Franchise, store: Store): Promise<null>;
  docs(docType: string): Promise<Endpoints>;
  updateUser(user: User): Promise<User>;
  getUsers(page: number, limit: number, name: string): Promise<UserListResponse>;
  deleteUser(userId: string): Promise<void>; // Changed from number to string
}

export {
  Role,
  isRole,
  PizzaService,
  User,
  Menu,
  Pizza,
  OrderHistory,
  Order,
  Franchise,
  FranchiseList,
  Store,
  OrderItem,
  Endpoint,
  Endpoints,
  OrderResponse,
  JWTPayload,
  UserListResponse, 
};