import CatFact from './catFact.js';

// Mock global fetch
global.fetch = jest.fn();

describe('CatFact', () => {
  let catFact;

  beforeEach(() => {
    catFact = new CatFact();
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('constructor initializes with empty facts array', () => {
    expect(catFact.history()).toEqual([]);
  });

  test('add() successfully fetches and stores a fact', async () => {
    const mockFact = 'Cats sleep 70% of their lives';
    fetch.mockResolvedValueOnce({
      json: async () => ({ data: [mockFact] }),
    });

    const fact = await catFact.add();
    expect(fact).toBe(mockFact);
    expect(catFact.history()).toEqual([mockFact]);
  });

  test('add() returns null if fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const fact = await catFact.add();
    expect(fact).toBeNull();
    expect(catFact.history()).toEqual([]);
  });

  test('history() returns the current facts', () => {
    catFact.facts = ['Fact1', 'Fact2'];
    expect(catFact.history()).toEqual(['Fact1', 'Fact2']);
  });

  test('call() invokes callback repeatedly with facts', async () => {
    const mockFact = 'Cats have 32 muscles in each ear';
    fetch.mockResolvedValue({
      json: async () => ({ data: [mockFact] }),
    });

    const callback = jest.fn();
    catFact.call(1000, callback);

    await jest.advanceTimersByTimeAsync(3000);
    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(mockFact);
  });
});
