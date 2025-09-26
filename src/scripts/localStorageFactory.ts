class LocalStorageFactory {
  static get(key: string) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static set(key: string, value: any) {
    try {
      const item = JSON.stringify(value);
      localStorage.setItem(key, item);
    } catch (error) {
      console.log(error);
    }
  }

  static clearItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.log(error);
    }
  }

  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.log(error);
    }
  }
}

export default LocalStorageFactory;
