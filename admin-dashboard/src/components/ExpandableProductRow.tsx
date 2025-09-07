// src/components/ExpandableProductRow.tsx
import React, { useState } from 'react';
import {
  TableRow, TableCell, Collapse, Box, Typography, Table, TableHead, TableBody, IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EditIcon from '@mui/icons-material/Edit';

interface ShopStock {
  inventoryId: number;
  shopId: number;
  shopName: string;
  quantity: number;
  lowStockThreshold: number;
}

interface Product {
  productId: number;
  productName: string;
  uniqueProductCode: string;
  totalStock: number;
  stockByShop: ShopStock[];
}

interface ExpandableProductRowProps {
  product: Product;
  onEditThreshold: (item: any) => void;
}

export const ExpandableProductRow = ({ product, onEditThreshold }: ExpandableProductRowProps) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">{product.productName}</TableCell>
        <TableCell>{product.uniqueProductCode}</TableCell>
        <TableCell align="right">{product.totalStock}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, padding: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom component="div">Stock Breakdown by Shop</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Shop Name</TableCell>
                    <TableCell align="center">Current Stock</TableCell>
                    <TableCell align="center">Low-Stock Threshold</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.stockByShop.map((shopStock) => (
                    <TableRow key={shopStock.shopId}>
                      <TableCell>{shopStock.shopName}</TableCell>
                      <TableCell align="center">{shopStock.quantity}</TableCell>
                      <TableCell align="center">{shopStock.lowStockThreshold}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => onEditThreshold({ ...shopStock, productName: product.productName })}>
                            <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};