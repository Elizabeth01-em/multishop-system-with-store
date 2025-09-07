// src/components/AddToCart.tsx
'use client';
import { useState } from 'react';
import { Box, Button, IconButton, TextField } from "@mui/material";
import { useCartStore } from "@/store/cartStore";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface Product {
  id: string;
  name: string;
  price: number;
  uniqueProductCode: string;
}

export const AddToCart = ({ product }: { product: Product }) => {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.items);
  
  const isInCart = cartItems.some(item => item.id === product.id);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      uniqueProductCode: product.uniqueProductCode
    });
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton 
          onClick={decrementQuantity}
          disabled={quantity <= 1}
          sx={{ 
            border: '1px solid #ddd',
            borderRadius: '4px 0 0 4px'
          }}
        >
          <RemoveIcon />
        </IconButton>
        <TextField
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          size="small"
          sx={{ 
            width: 60, 
            textAlign: 'center',
            '& .MuiOutlinedInput-root': {
              borderRadius: 0
            }
          }}
          inputProps={{ 
            min: 1, 
            style: { textAlign: 'center' } 
          }}
        />
        <IconButton 
          onClick={incrementQuantity}
          sx={{ 
            border: '1px solid #ddd',
            borderRadius: '0 4px 4px 0'
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>
      
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={isInCart ? undefined : <ShoppingCartIcon />}
        onClick={handleAddToCart}
        sx={{ 
          py: 1.5,
          fontWeight: 600,
          textTransform: 'none'
        }}
      >
        {isInCart ? 'Added to Cart' : 'Add to Cart'}
      </Button>
    </Box>
  )
}