// src/components/ExportToolbar.tsx
import React, { useState, MouseEvent } from 'react';
import { Box, Button, Menu, MenuItem, ListItemIcon } from '@mui/material';
import { GridToolbarContainer, GridToolbarFilterButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import ArticleIcon from '@mui/icons-material/Article'; // for CSV/XLSX
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// Import our utility functions
import { exportToCsv, exportToXlsx, exportToPdf } from '../utils/exportUtils';

// This component receives the data and columns to be exported as props
const ExportToolbar = (props: { data: any[]; columns: any[]; filename: string }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleExport = (exportFunction: (data: any[], columns: any[], filename: string) => void) => {
    exportFunction(props.data, props.columns, props.filename);
    handleClose();
  };

  return (
    <GridToolbarContainer>
      {/* Add the default DataGrid toolbar buttons for a good user experience */}
      <GridToolbarFilterButton placeholder={undefined} onResize={undefined} onResizeCapture={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
      <GridToolbarDensitySelector placeholder={undefined} onResize={undefined} onResizeCapture={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
      <Box sx={{ flexGrow: 1 }} />

      {/* Our custom export button */}
      <Button
        startIcon={<DownloadIcon />}
        onClick={handleClick}
        size="small"
        variant="outlined"
      >
        Export
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleExport(exportToCsv)}>
          <ListItemIcon><ArticleIcon fontSize="small" /></ListItemIcon>
          Export as CSV
        </MenuItem>
        <MenuItem onClick={() => handleExport(exportToXlsx)}>
          <ListItemIcon><ArticleIcon fontSize="small" /></ListItemIcon>
          Export as XLSX
        </MenuItem>
        <MenuItem onClick={() => handleExport(exportToPdf)}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
          Export as PDF
        </MenuItem>
      </Menu>
    </GridToolbarContainer>
  );
};

export default ExportToolbar;