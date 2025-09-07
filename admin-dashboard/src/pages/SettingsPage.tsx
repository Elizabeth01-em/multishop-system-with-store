// src/pages/SettingsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography, Box, Grid, TextField, Switch, FormControlLabel,
  Button, CircularProgress, Alert, Divider, FormHelperText, Card, CardContent
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

// Define the Setting interface
interface Setting {
  key: string;
  value: string;
  name: string;
  description: string;
  type: string;
  group: string;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/settings');
        setSettings(response.data);
        // Transform the array of settings into a key-value object for our form state
        const initialFormValues = response.data.reduce((acc: { [key: string]: string }, setting: Setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        setFormValues(initialFormValues);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('Failed to load system settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const groupedSettings = useMemo(() => {
    // Group settings by their 'group' property for rendering
    return settings.reduce((acc: { [key: string]: Setting[] }, setting: Setting) => {
      (acc[setting.group] = acc[setting.group] || []).push(setting);
      return acc;
    }, {});
  }, [settings]);

  const handleValueChange = (key: string, value: string | boolean) => {
    setFormValues(prev => ({ ...prev, [key]: String(value) }));
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
        // Transform the formValues object back into an array for the API
        const payload = Object.keys(formValues).map(key => ({
            key,
            value: formValues[key]
        }));
        await api.patch('/settings', { settings: payload });
        showNotification('Settings saved successfully!', 'success');
    } catch (err: any) {
        showNotification(err.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
        setSaving(false);
    }
  };

  const renderSettingInput = (setting: Setting) => {
    const value = formValues[setting.key];

    switch (setting.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value === 'true'}
                onChange={(e) => handleValueChange(setting.key, e.target.checked)}
              />
            }
            label={setting.name}
          />
        );
      case 'number':
        return (
          <TextField
            label={setting.name}
            type="number"
            value={value || ''}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            fullWidth
          />
        );
      case 'string':
      default:
        return (
          <TextField
            label={setting.name}
            type="text"
            value={value || ''}
            onChange={(e) => handleValueChange(setting.key, e.target.value)}
            fullWidth
          />
        );
    }
  };
  
  if(loading) return <Layout><CircularProgress /></Layout>
  if(error) return <Layout><Alert severity='error'>{error}</Alert></Layout>

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">System Settings</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? <CircularProgress size={24}/> : 'Save All Settings'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {Object.keys(groupedSettings).map((groupName) => (
          <Grid item xs={12} key={groupName}>
            <Card sx={{ 
              boxShadow: '0 4px 20px -8px rgba(0,0,0,0.1)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" textTransform="capitalize" gutterBottom>{groupName}</Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  {groupedSettings[groupName].map((setting: Setting) => (
                    <Grid item xs={12} key={setting.key}>
                      {renderSettingInput(setting)}
                      <FormHelperText sx={{ml: '14px'}}>{setting.description}</FormHelperText>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
};

export default SettingsPage;