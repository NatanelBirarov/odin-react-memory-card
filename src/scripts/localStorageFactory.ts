const LocalStorageFactory = {
  get(key: string): unknown {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  set(key: string, value: unknown) {
    try {
      const item = JSON.stringify(value);
      localStorage.setItem(key, item);
    } catch (error) {
      console.log(error);
    }
  },

  clearItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.log(error);
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.log(error);
    }
  },
};

export default LocalStorageFactory;
