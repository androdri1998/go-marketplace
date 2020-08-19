import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Product } from '../pages/Cart/styles';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem(
        '@goMarketplace:products',
      );
      setProducts(productsStorage ? JSON.parse(productsStorage) : []);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productsStorage = await AsyncStorage.getItem(
      '@goMarketplace:products',
    );
    const productsToValidate = productsStorage
      ? JSON.parse(productsStorage)
      : [];

    const findProductIndex = productsToValidate.findIndex(
      (productValidate: Product) => productValidate.id === product.id,
    );

    let newProducts = [];
    if (findProductIndex >= 0) {
      const newProductToAdd = {
        ...product,
        quantity: productsToValidate[findProductIndex].quantity + 1,
      };
      productsToValidate[findProductIndex] = newProductToAdd;
      newProducts = [...productsToValidate];
    } else {
      newProducts = [...productsToValidate, { ...product, quantity: 1 }];
    }

    setProducts(newProducts);
    await AsyncStorage.setItem(
      '@goMarketplace:products',
      JSON.stringify(newProducts),
    );
  }, []);

  const increment = useCallback(
    async id => {
      const productsToValidate = products;

      const findProductIndex = productsToValidate.findIndex(
        (productValidate: Product) => productValidate.id === id,
      );

      let newProducts = [...productsToValidate];
      if (findProductIndex >= 0) {
        productsToValidate[findProductIndex] = {
          ...productsToValidate[findProductIndex],
          quantity: productsToValidate[findProductIndex].quantity + 1,
        };
        newProducts = [...productsToValidate];
      }

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@goMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsToValidate = products;

      const findProductIndex = productsToValidate.findIndex(
        (productValidate: Product) => productValidate.id === id,
      );

      let newProducts = [...productsToValidate];
      if (findProductIndex >= 0) {
        if (productsToValidate[findProductIndex].quantity === 1) {
          newProducts = [...productsToValidate];
        } else {
          productsToValidate[findProductIndex] = {
            ...productsToValidate[findProductIndex],
            quantity: productsToValidate[findProductIndex].quantity - 1,
          };
          newProducts = [...productsToValidate];
        }
      }

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@goMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
