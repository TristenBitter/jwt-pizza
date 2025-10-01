import httpPizzaService from './httpPizzaService';
import { PizzaService } from './pizzaService';

const pizzaService: PizzaService = httpPizzaService;
export { pizzaService };
