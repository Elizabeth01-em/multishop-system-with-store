// src/components/OwnerDashboardWidgets.tsx
import React, { Fragment } from 'react';
import {
    Grid, Card, CardContent, Typography, Avatar, Box, Collapse, Table, TableBody, TableCell, TableRow
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { formatCurrency } from '../utils/currency';

const StatCard = ({ title, value, icon, color = 'primary' }: { title: string; value: string | number; icon: React.ReactNode; color?: 'primary' | 'secondary' }) => (
    <Card sx={{ 
      boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
      borderRadius: 2, 
      height: '100%' 
    }}>
        <CardContent>
            <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
                    {icon}
                </Avatar>
                <Box>
                    <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        {value}
                    </Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const ExpandableInventoryRow = ({ row }: { row: any }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <Fragment>
            <TableRow onClick={() => setOpen(!open)} sx={{ '& > *': { borderBottom: 'unset' }, cursor: 'pointer' }}>
                <TableCell>{row.productName}</TableCell>
                <TableCell>{row.uniqueProductCode}</TableCell>
                <TableCell align="right">{row.totalStock}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">Stock by Shop</Typography>
                            <Table size="small">
                                <TableBody>
                                    {row.stockByShop.map((shopStock: any) => (
                                        <TableRow key={shopStock.shopId}>
                                            <TableCell>{shopStock.shopName}</TableCell>
                                            <TableCell align="right">{shopStock.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    )
}

export const OwnerDashboardWidgets = ({ stats }: { stats: any }) => {
    const { sales, inventory } = stats;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
                <StatCard title="Total Revenue" value={formatCurrency(sales.totalRevenue)} icon={<MonetizationOnIcon />} />
            </Grid>
            <Grid item xs={12} sm={6}>
                <StatCard title="Total Sales Count" value={sales.totalSalesCount} icon={<PointOfSaleIcon />} color="secondary" />
            </Grid>
            <Grid item xs={12}>
                <Card sx={{ 
                  boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
                  borderRadius: 2 
                }}>
                    <CardContent>
                        <Typography variant="h6">Company-Wide Inventory Overview</Typography>
                         <Table>
                             <TableBody>
                                {inventory.map((row: any) => (<ExpandableInventoryRow key={row.productId} row={row}/>))}
                             </TableBody>
                         </Table>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};