// context/StateContext.js
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';

const Context = createContext();

export const StateContext = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantities, setTotalQuantities] = useState(0);
  const [qty, setQty] = useState(1);

  let foundProduct;
  let index;

  const onAdd = (product, quantity) => {
    // Defensive checks
    if (!product || !product._id) {
      console.error('onAdd called with invalid product:', product);
      toast.error('Could not add item — product data is missing.');
      return;
    }

    // find existing product in cart
    const checkProductInCart = cartItems.find((item) => item._id === product._id);

    // update totals
    setTotalPrice((prevTotalPrice) => prevTotalPrice + product.price * quantity);
    setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + quantity);

    if (checkProductInCart) {
      // correctly return each item (don't produce undefined entries)
      const updatedCartItems = cartItems.map((cartProduct) => {
        if (cartProduct._id === product._id) {
          return {
            ...cartProduct,
            quantity: cartProduct.quantity + quantity,
          };
        }
        return cartProduct;
      });

      setCartItems(updatedCartItems);
    } else {
      // don't mutate the incoming product object — create a new object
      const productToAdd = { ...product, quantity };
      setCartItems([...cartItems, productToAdd]);
    }

    // use the passed quantity (not the global qty state) for the message
    toast.success(`${quantity} ${product.name} added to the cart.`);
  };

  const onRemove = (product) => {
    if (!product || !product._id) return;

    foundProduct = cartItems.find((item) => item._id === product._id);
    if (!foundProduct) return;

    const newCartItems = cartItems.filter((item) => item._id !== product._id);

    setTotalPrice((prevTotalPrice) => prevTotalPrice - foundProduct.price * foundProduct.quantity);
    setTotalQuantities((prevTotalQuantities) => prevTotalQuantities - foundProduct.quantity);
    setCartItems(newCartItems);
  };

  const toggleCartItemQuanitity = (id, value) => {
    setCartItems((prevCartItems) => {
      return prevCartItems.reduce((acc, item) => {
        if (item._id !== id) {
          acc.push(item);
          return acc;
        }
  
        // INC
        if (value === "inc") {
          setTotalPrice((prev) => prev + item.price);
          setTotalQuantities((prev) => prev + 1);
          acc.push({ ...item, quantity: item.quantity + 1 });
          return acc;
        }
  
        // DEC
        if (value === "dec") {
          // Case 1: quantity > 1 → decrease normally
          if (item.quantity > 1) {
            setTotalPrice((prev) => prev - item.price);
            setTotalQuantities((prev) => prev - 1);
            acc.push({ ...item, quantity: item.quantity - 1 });
            return acc;
          }
  
          // Case 2: quantity === 1 → REMOVE item
          setTotalPrice((prev) => prev - item.price);
          setTotalQuantities((prev) => prev - 1);
          // ⚠️ DO NOT push item → removed
          return acc;
        }
  
        acc.push(item);
        return acc;
      }, []);
    });
  };
  

  const incQty = () => {
    setQty((prevQty) => prevQty + 1);
  };

  const decQty = () => {
    setQty((prevQty) => {
      if (prevQty - 1 < 1) return 1;
      return prevQty - 1;
    });
  };

  return (
    <Context.Provider
      value={{
        showCart,
        setShowCart,
        cartItems,
        totalPrice,
        totalQuantities,
        qty,
        incQty,
        decQty,
        onAdd,
        toggleCartItemQuanitity,
        onRemove,
        setCartItems,
        setTotalPrice,
        setTotalQuantities,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useStateContext = () => useContext(Context);
